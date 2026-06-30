# Upstream sync (syncrm → property-shop-crm)

This repository is a **white-label downstream** of
[`LayerSyncAi/syncrm`](https://github.com/LayerSyncAi/syncrm). It was originally
created as a one-time snapshot fork (at upstream PR #91) with **no link back to
upstream** — so for a while, upstream changes (e.g. PR #93, the PWA/legal/reporting
feature) never propagated and had to be ported by hand.

The [`upstream-sync`](../.github/workflows/upstream-sync.yml) workflow is the
permanent channel that closes that gap.

## What it does

On a weekly schedule (and on demand), the workflow:

1. Fetches `LayerSyncAi/syncrm`'s default branch.
2. Rebuilds a bot branch `automated/upstream-sync` from this repo's `main` and
   merges upstream into it (a real 3-way merge — common ancestor is the original
   fork point).
3. Opens a **review pull request** with the result. It **never pushes to `main`
   directly**, because the white-label branding here deliberately diverges from
   upstream and conflicts need a human decision.

If the merge hits conflicts, they are committed **as `<<<<<<<` markers** and
listed in the PR body so you can see exactly what to resolve. CI will fail until
the markers are gone — that's intentional.

If a sync PR is already open, the workflow leaves it alone (it won't clobber an
in-progress review). Once that PR is merged or closed, the next run continues
from the updated `main`.

## One-time setup: the upstream access token

`syncrm` is a **separate repository**, and the default `GITHUB_TOKEN` in Actions
can only read *this* repo. To let the workflow fetch upstream you must add a
secret named **`UPSTREAM_SYNC_TOKEN`**:

1. Create a token that can **read** `LayerSyncAi/syncrm`:
   - **Fine-grained PAT** (recommended): Repository access → `LayerSyncAi/syncrm`;
     Permissions → **Contents: Read-only**. Or
   - **Classic PAT** with the `repo` scope.
   - (If `syncrm` is ever made public, no token is needed and the workflow falls
     back to an unauthenticated fetch — but it will warn.)
2. Add it to this repo: **Settings → Secrets and variables → Actions → New
   repository secret** → name `UPSTREAM_SYNC_TOKEN`, paste the token.

Without this secret and with a private upstream, the workflow's fetch step will
fail (visibly, in the Actions log).

## Running it manually

**Actions → "Sync from upstream (syncrm)" → Run workflow.** You can optionally
override the upstream branch via the `upstream_ref` input (defaults to `main`).

## Resolving a sync PR

1. Open the PR labelled `upstream-sync`.
2. If it merged cleanly: review the diff and merge once CI is green.
3. If it has conflict markers:
   ```bash
   git fetch origin automated/upstream-sync
   git checkout automated/upstream-sync
   # resolve each conflicted file, KEEPING the Property Shop branding
   #   (e.g. src/config/brand.ts, login page, manifest, logos)
   git add -A && git commit
   git push
   ```
   Branding lives behind `NEXT_PUBLIC_BRAND_*` / `src/config/brand.ts` (see
   `docs/BRANDING.md`), so most upstream changes should *not* touch branding —
   prefer taking upstream's version for logic files and keeping ours only for the
   white-label bits.
4. Merge when CI is green.

## Tuning the schedule

Edit the `cron` line in
[`.github/workflows/upstream-sync.yml`](../.github/workflows/upstream-sync.yml).
It currently runs Mondays at 06:17 UTC.
