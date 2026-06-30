import { v } from "convex/values";
import { internalMutation, internalQuery, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Scrypt } from "lucia";

/**
 * One-off repair utilities for accounts whose `users` row was deleted directly
 * in the Convex dashboard.
 *
 * `@convex-dev/auth` keeps the actual password in a separate `authAccounts`
 * table (keyed by email), not on the `users` row. Deleting a user straight from
 * the `users` table leaves that `authAccounts` row — plus any `authSessions` /
 * `authRefreshTokens` — orphaned, pointing at a userId that no longer exists.
 *
 * When the same person is re-added, a SECOND `authAccounts` row is created for
 * the same email. Sign-in looks the account up by email expecting exactly one
 * match, so the duplicate makes every login fail with a generic
 * "wrong username or password" — even right after a password reset, because the
 * reset only patches one of the two rows.
 *
 * These functions purge every password account for an email and rebuild a single
 * clean one tied to the current live user, with the temp password "12345678".
 *
 * Run from the Convex dashboard (Functions tab):
 *   1. `authRepair:diagnoseUserAuth` with { email } to inspect the mess.
 *   2. `authRepair:repairUserAuth` with { emails: ["a@x.com", "b@x.com", ...] }.
 */

/** Default temp password issued to repaired accounts (matches admin-create flow). */
const DEFAULT_TEMP_PASSWORD = "12345678";

/** Inspect every password auth account tied to an email, without changing anything. */
export const diagnoseUserAuth = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();

    const liveUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    const accounts = await ctx.db
      .query("authAccounts")
      .filter((q) =>
        q.and(
          q.eq(q.field("provider"), "password"),
          q.eq(q.field("providerAccountId"), email)
        )
      )
      .collect();

    const accountDetails = await Promise.all(
      accounts.map(async (acct) => {
        const owner = await ctx.db.get(acct.userId);
        return {
          accountId: acct._id,
          userId: acct.userId,
          ownerExists: owner !== null,
          pointsToLiveUser: liveUser !== null && acct.userId === liveUser._id,
        };
      })
    );

    return {
      email,
      liveUser: liveUser
        ? { _id: liveUser._id, isActive: liveUser.isActive, orgId: liveUser.orgId }
        : null,
      passwordAccountCount: accounts.length,
      accounts: accountDetails,
      // The healthy state is: liveUser != null && passwordAccountCount === 1
      // && that one account points to the live user.
      healthy:
        liveUser !== null &&
        accounts.length === 1 &&
        accounts[0].userId === liveUser._id,
    };
  },
});

/** Internal: rebuild a single clean password account for one email. */
export const repairUserAuthInternal = internalMutation({
  args: { email: v.string(), passwordHash: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();

    // The current, live user row for this email must already exist (re-added
    // from the site). We rebuild auth around it; we never recreate the user.
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (!user) {
      throw new Error(
        `No users row found for ${email}. Re-add the user from the site first, then run this repair.`
      );
    }

    // Every password account currently tied to this email (orphans + duplicates).
    const accounts = await ctx.db
      .query("authAccounts")
      .filter((q) =>
        q.and(
          q.eq(q.field("provider"), "password"),
          q.eq(q.field("providerAccountId"), email)
        )
      )
      .collect();

    // Clean sessions for the live user AND every (possibly dead) userId those
    // accounts referenced, so no stale session survives the repair.
    const userIdsToClear = new Set<string>([user._id]);
    for (const acct of accounts) userIdsToClear.add(acct.userId);

    // Delete the accounts and their dependent verification codes.
    let deletedAccounts = 0;
    for (const acct of accounts) {
      const codes = await ctx.db
        .query("authVerificationCodes")
        .filter((q) => q.eq(q.field("accountId"), acct._id))
        .collect();
      for (const code of codes) await ctx.db.delete(code._id);
      await ctx.db.delete(acct._id);
      deletedAccounts++;
    }

    // Delete sessions (and their refresh tokens) for each referenced userId.
    let deletedSessions = 0;
    for (const uid of userIdsToClear) {
      const sessions = await ctx.db
        .query("authSessions")
        .filter((q) => q.eq(q.field("userId"), uid))
        .collect();
      for (const session of sessions) {
        const tokens = await ctx.db
          .query("authRefreshTokens")
          .filter((q) => q.eq(q.field("sessionId"), session._id))
          .collect();
        for (const token of tokens) await ctx.db.delete(token._id);
        await ctx.db.delete(session._id);
        deletedSessions++;
      }
    }

    // Recreate exactly one clean password account for the live user.
    await ctx.db.insert("authAccounts", {
      userId: user._id,
      provider: "password",
      providerAccountId: email,
      secret: args.passwordHash,
    });

    // Force a password change on first login and clear any stale reset tokens.
    const now = Date.now();
    await ctx.db.patch(user._id, {
      resetPasswordOnNextLogin: true,
      updatedAt: now,
    });

    const staleResetTokens = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const token of staleResetTokens) {
      if (!token.usedAt) await ctx.db.patch(token._id, { usedAt: now });
    }

    await ctx.db.insert("auditLogs", {
      actorUserId: user._id,
      actorLabel: user.email,
      action: "user.auth_repaired",
      category: "auth",
      description: `Rebuilt password account for ${email} (removed ${deletedAccounts} stale account(s), ${deletedSessions} session(s)); temp password reissued`,
      targetType: "user",
      targetId: user._id,
      targetLabel: user.email,
      orgId: user.orgId,
      createdAt: now,
    });

    return {
      email,
      userId: user._id,
      deletedAccounts,
      deletedSessions,
      tempPassword: DEFAULT_TEMP_PASSWORD,
    };
  },
});

/**
 * Repair one or more emails in a single run. Hashes the temp password and
 * rebuilds a clean password account for each. Safe to re-run (idempotent).
 */
export const repairUserAuth = internalAction({
  args: { emails: v.array(v.string()) },
  handler: async (ctx, args) => {
    const passwordHash = await new Scrypt().hash(DEFAULT_TEMP_PASSWORD);

    const results = [];
    for (const rawEmail of args.emails) {
      const email = rawEmail.trim().toLowerCase();
      try {
        const result = await ctx.runMutation(
          internal.authRepair.repairUserAuthInternal,
          { email, passwordHash }
        );
        results.push({ ...result, ok: true });
      } catch (error) {
        results.push({
          email,
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return results;
  },
});
