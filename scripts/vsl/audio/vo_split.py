#!/usr/bin/env python3
# Copied unchanged from the LayerSync motion studio skill (scripts/vo_split.py) so this pipeline is self-contained.
"""Cut a voiceover take into its phrases, tighten the pauses, and write the new timing.

Usage:
  python vo_split.py take.mp3 out.wav timeline.json --names hook,stock,sales,... \
      [--gaps hook=0.5,everyday=0.85] [--default-gap 0.35] [--noise -38] [--min-pause 0.22] [--tail 2.0]

- Phrases are found from the pauses ElevenLabs leaves at <break> tags (and natural pauses).
- --names labels each phrase in order; the count must match what's detected (the script stops and
  prints the phrases it found if it doesn't, so you can adjust --min-pause or the names).
- Each phrase keeps its delivery untouched; only the silence between phrases changes. --gaps sets the
  pause after a named phrase (use longer gaps where the picture changes scene), --default-gap the rest.
- timeline.json maps each name to [start, end] seconds in the new take: storyboard timings come from it.
- --tail adds silence after the last phrase for the closing card (the video length = last end + tail).
"""
import argparse
import json
import re
import subprocess
import tempfile
import os
import wave

import numpy as np

SR = 44100


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("take")
    ap.add_argument("out")
    ap.add_argument("timeline")
    ap.add_argument("--names", required=True)
    ap.add_argument("--gaps", default="")
    ap.add_argument("--default-gap", type=float, default=0.35)
    ap.add_argument("--noise", type=float, default=-38)
    ap.add_argument("--min-pause", type=float, default=0.22)
    ap.add_argument("--tail", type=float, default=2.0)
    ap.add_argument("--lead", type=float, default=0.15)
    a = ap.parse_args()
    names = [n.strip() for n in a.names.split(",") if n.strip()]
    gaps = {k: float(v) for k, v in (g.split("=") for g in a.gaps.split(",") if g)}

    log = subprocess.run(["ffmpeg", "-i", a.take, "-af", f"silencedetect=noise={a.noise}dB:d={a.min_pause}",
                          "-f", "null", "-"], capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", log)]
    ends = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", log)]
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, "v.wav")
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", a.take, "-ar", str(SR), "-ac", "1", wav], check=True)
        w = wave.open(wav)
        vo = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(float) / 32768
    total = len(vo) / SR
    thr = 10 ** (a.noise / 20)
    first_on = np.argmax(np.abs(vo) > thr) / SR
    seg_starts = [first_on] + ends[: len(starts)]
    seg_ends = starts + [total]
    segs = [(s, e) for s, e in zip(seg_starts, seg_ends) if e - s > 0.15]
    if len(segs) != len(names):
        print(f"Found {len(segs)} phrases but {len(names)} names:")
        for s, e in segs:
            print(f"  {s:6.2f} - {e:6.2f}")
        raise SystemExit(1)

    pad = 0.06
    t = a.lead
    out = np.zeros(int((total + 10) * SR))
    timeline = {}
    for (s, e), nm in zip(segs, names):
        s2, e2 = max(0, s - pad), min(total, e + pad)
        clip = vo[int(s2 * SR):int(e2 * SR)].copy()
        f = int(0.01 * SR)
        clip[:f] *= np.linspace(0, 1, f)
        clip[-f:] *= np.linspace(1, 0, f)
        i = int(t * SR)
        out[i:i + len(clip)] += clip
        timeline[nm] = [round(t + (s - s2), 3), round(t + (e - s2), 3)]
        t += (e2 - s2) - 2 * pad + gaps.get(nm, a.default_gap)
    last = timeline[names[-1]][1]
    timeline["_duration"] = round(last + a.tail, 2)
    out = out[: int((last + a.tail) * SR)]
    out = out / max(1e-6, np.abs(out).max()) * 0.7
    w = wave.open(a.out, "wb")
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((out * 32767).astype("<i2").tobytes())
    w.close()
    json.dump(timeline, open(a.timeline, "w"), indent=1)
    print(f"{len(names)} phrases, video length {timeline['_duration']}s")
    for nm in names:
        print(f"  {nm:12s} {timeline[nm][0]:6.2f} - {timeline[nm][1]:6.2f}")


if __name__ == "__main__":
    main()
