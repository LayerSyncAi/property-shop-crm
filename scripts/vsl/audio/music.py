#!/usr/bin/env python3
"""The VSL music bed: tense until the reveal, then warm and upbeat to the end.

Usage: python music.py out.wav --duration 137.2 --turn 33.9 [--bpm 98] [--seed 7]

Built from compose.py (the LayerSync motion studio's in-house composer): a tense-resolve
section up to --turn, crossfaded into an upbeat section that runs to the end and closes on
a held chord. Original synthesis, no samples, no credits.
"""
import argparse
import os
import sys
import wave

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from compose import SR, compose  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    ap.add_argument("--duration", type=float, required=True)
    ap.add_argument("--turn", type=float, required=True)
    ap.add_argument("--bpm", type=float, default=98)
    ap.add_argument("--seed", type=int, default=7)
    a = ap.parse_args()

    n = int((a.duration + 0.05) * SR)
    out = np.zeros((n, 2))

    # Section A: the problem, resolving on the turn. Let it ring 2.5 s, then fade.
    tense = compose(a.turn + 2.5, a.turn, "tense-resolve", a.bpm, a.seed)
    fade = int(1.6 * SR)
    tense[-fade:] *= np.linspace(1, 0, fade)[:, None]
    out[: min(n, len(tense))] += tense[:n] * 0.9

    # Section B: the solution, from the turn to the end.
    up = compose(a.duration - a.turn, None, "upbeat", a.bpm, a.seed + 1)
    rise = int(0.5 * SR)
    up[:rise] *= np.linspace(0, 1, rise)[:, None]
    i = int(a.turn * SR)
    m = min(len(up), n - i)
    out[i:i + m] += up[:m] * 0.8

    out = out / max(1e-6, np.abs(out).max()) * 0.85
    w = wave.open(a.out, "wb")
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype("<i2").tobytes())
    w.close()
    print(f"Wrote {a.out}: {a.duration:.1f}s, turn at {a.turn:.1f}s")


if __name__ == "__main__":
    main()
