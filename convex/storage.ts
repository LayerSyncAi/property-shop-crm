import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { getCurrentUser, PLATFORM_READ_ONLY_MESSAGE } from "./helpers";

/** Uploads/deletes are unscoped, so platform staff are refused explicitly. */
async function requireWritingUser(ctx: Parameters<typeof getCurrentUser>[0]) {
  const user = await getCurrentUser(ctx);
  if (user.isPlatformAdmin) {
    throw new ConvexError(PLATFORM_READ_ONLY_MESSAGE);
  }
  return user;
}

/**
 * Generate an upload URL for file uploads.
 * Only authenticated users can upload files.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireWritingUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Get a public URL for a stored file.
 */
export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * Get multiple URLs for stored files.
 */
export const getUrls = query({
  args: { storageIds: v.array(v.id("_storage")) },
  handler: async (ctx, args) => {
    const urls = await Promise.all(
      args.storageIds.map(async (id) => {
        const url = await ctx.storage.getUrl(id);
        return { id, url };
      })
    );
    return urls;
  },
});

/**
 * Delete a file from storage.
 * Only authenticated users can delete files.
 */
export const deleteFile = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await requireWritingUser(ctx);
    await ctx.storage.delete(args.storageId);
  },
});
