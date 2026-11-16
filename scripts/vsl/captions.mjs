#!/usr/bin/env node
/**
 * WebVTT captions for the narrated VSL, one cue per spoken phrase.
 *
 *   node scripts/vsl/captions.mjs timeline.json > sync-estate-vsl.vtt
 *
 * The script is written for the voice ("Sync C R M", "U S dollars"); captions use
 * the written product names instead.
 */
import { readFileSync } from "node:fs";
import { loadScript } from "./timeline.mjs";

const WRITTEN = [
  [/Sync C R M/g, "SynCRM"],
  [/Sync Estate/g, "SyncEstate"],
  [/Sync (Stay|Worth|Finance|Dev|Media)/g, "Sync$1"],
  [/U S dollars/g, "US dollars"],
  [/\bZig\b/g, "ZiG"],
];

function written(text) {
  return WRITTEN.reduce((s, [re, to]) => s.replace(re, to), text);
}

function stamp(t) {
  const ms = Math.max(0, Math.round(t * 1000));
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  return `${h}:${m}:${s}.${String(ms % 1000).padStart(3, "0")}`;
}

const tl = JSON.parse(readFileSync(process.argv[2], "utf8"));
const lines = ["WEBVTT", ""];
for (const p of loadScript().phrases) {
  const [s, e] = tl[p.name];
  lines.push(p.name, `${stamp(s)} --> ${stamp(e + 0.25)}`, written(p.text), "");
}
process.stdout.write(lines.join("\n"));
