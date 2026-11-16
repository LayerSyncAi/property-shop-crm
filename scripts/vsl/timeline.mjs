#!/usr/bin/env node
/**
 * Builds the VSL timeline: { phraseName: [start, end], _duration } in seconds.
 *
 *   node scripts/vsl/timeline.mjs [out.json]
 *
 * Without a voiceover the timing is synthesised from script.json: each phrase
 * lasts words / wordsPerSecond, followed by its gap; the end card is held for
 * `tail` seconds after the last phrase. With a real voiceover, use the
 * timeline.json that audio/vo_split.py writes instead (same shape).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

export function loadScript() {
  return JSON.parse(readFileSync(join(here, "script.json"), "utf8"));
}

export function synthTimeline(script = loadScript()) {
  const wps = script.wordsPerSecond ?? 2.6;
  let t = script.lead ?? 0.35;
  const out = {};
  for (const p of script.phrases) {
    const words = p.text.split(/\s+/).filter(Boolean).length;
    const dur = Math.max(1.6, words / wps);
    out[p.name] = [round(t), round(t + dur)];
    t += dur + (p.gap ?? 0.5);
  }
  const last = script.phrases[script.phrases.length - 1].name;
  out._duration = round(out[last][1] + (script.tail ?? 4.6));
  return out;
}

/** Checks a timeline has every phrase, in order. Throws with a clear message if not. */
export function validateTimeline(tl, script = loadScript()) {
  let prev = -1;
  for (const p of script.phrases) {
    const span = tl[p.name];
    if (!Array.isArray(span) || span.length !== 2) throw new Error(`timeline is missing "${p.name}"`);
    if (span[0] < prev) throw new Error(`timeline phrase "${p.name}" starts before the previous one ends`);
    prev = span[1];
  }
  if (!(tl._duration > prev)) throw new Error("timeline _duration must be after the last phrase");
  return tl;
}

function round(x) {
  return Math.round(x * 1000) / 1000;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const tl = synthTimeline();
  const json = JSON.stringify(tl, null, 1);
  if (process.argv[2]) writeFileSync(process.argv[2], json);
  else process.stdout.write(json + "\n");
}
