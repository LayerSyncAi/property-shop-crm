#!/usr/bin/env node
/**
 * Renders the VSL picture: vsl.html -> silent MP4 (and the sound-effect cue list).
 *
 *   node scripts/vsl/render.mjs --out silent.mp4 [--timeline timeline.json] [--fps 30]
 *        [--crf 23] [--events sfx-board.json] [--stills 2,10,40 --stills-dir dir] [--from 0 --to 20]
 *
 * --timeline   phrase timings (from audio/vo_split.py); defaults to the synthetic timeline
 * --events     writes the sound-effects board for audio/sfx.py
 * --stills     only renders PNG stills at those times (seconds) into --stills-dir
 * --from/--to  renders part of the video (for quick previews)
 *
 * Uses the Chromium that ships with the environment's Playwright. Every frame is a
 * pure function of t (window.vsl.seek), so renders are repeatable.
 */
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { synthTimeline, validateTimeline } from "./timeline.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

function args() {
  const a = {};
  const v = process.argv.slice(2);
  for (let i = 0; i < v.length; i++) {
    if (v[i].startsWith("--")) {
      const k = v[i].slice(2);
      a[k] = v[i + 1] && !v[i + 1].startsWith("--") ? v[++i] : true;
    }
  }
  return a;
}

async function main() {
  const a = args();
  const tl = validateTimeline(a.timeline ? JSON.parse(readFileSync(a.timeline, "utf8")) : synthTimeline());
  const fps = Number(a.fps ?? 30);
  const { chromium } = require("playwright");
  // File-URL CSS masks need this flag (mask-image is a CORS fetch).
  const browser = await chromium.launch({ args: ["--allow-file-access-from-files"] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => console.error("page error:", e.message));
  await page.goto(pathToFileURL(join(here, "vsl.html")).href);
  const info = await page.evaluate((t) => window.vsl.init(t), tl);
  await page.evaluate(() => window.vsl.ready());

  if (a.events) {
    const board = {
      id: "sync-estate-vsl",
      duration: info.duration,
      scenes: [],
      sfx_events: info.events.map((e) => ({ t: +e.t.toFixed(3), sound: e.sound, gain: e.gain, ...(e.d ? { d: e.d } : {}) })),
    };
    writeFileSync(a.events, JSON.stringify(board, null, 1));
    console.log(`sound board: ${board.sfx_events.length} cues -> ${a.events}`);
  }

  if (a.stills) {
    const dir = resolve(a["stills-dir"] ?? ".");
    mkdirSync(dir, { recursive: true });
    for (const s of String(a.stills).split(",")) {
      const t = parseFloat(s);
      await page.evaluate((x) => window.vsl.seek(x), t);
      const f = join(dir, `still-${t.toFixed(2).padStart(6, "0")}.png`);
      await page.screenshot({ path: f });
      console.log(f);
    }
    await browser.close();
    return;
  }

  if (!a.out) throw new Error("--out is required");
  const t0 = Number(a.from ?? 0);
  const t1 = Math.min(Number(a.to ?? info.duration), info.duration);
  const frames = Math.round((t1 - t0) * fps);
  const crf = String(a.crf ?? 23);
  const ff = spawn(
    "ffmpeg",
    ["-loglevel", "error", "-y", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-",
      "-c:v", "libx264", "-preset", String(a.preset ?? "slow"), "-crf", crf, "-tune", "animation",
      "-pix_fmt", "yuv420p", "-g", String(fps * 2), "-movflags", "+faststart", "-r", String(fps), a.out],
    { stdio: ["pipe", "inherit", "inherit"] },
  );
  const started = Date.now();
  for (let i = 0; i < frames; i++) {
    const t = t0 + i / fps;
    await page.evaluate((x) => window.vsl.seek(x), t);
    const buf = await page.screenshot({ type: "jpeg", quality: Number(a.quality ?? 92) });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (i % (fps * 10) === 0) console.log(`  ${t.toFixed(1)}s / ${t1.toFixed(1)}s  (${((Date.now() - started) / 1000).toFixed(0)}s elapsed)`);
  }
  ff.stdin.end();
  await new Promise((r, j) => ff.on("close", (c) => (c === 0 ? r() : j(new Error("ffmpeg exited " + c)))));
  await browser.close();
  console.log(`wrote ${a.out}: ${frames} frames, ${(t1 - t0).toFixed(2)}s`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
