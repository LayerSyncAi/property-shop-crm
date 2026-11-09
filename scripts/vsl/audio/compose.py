#!/usr/bin/env python3
# Copied unchanged from the LayerSync motion studio skill (scripts/compose.py) so this pipeline is self-contained.
"""Compose an original background music bed fitted to a Reel's timeline. No samples, no credits.

Usage:
  python compose.py out.wav --duration 19.6 [--turn 13.7] [--mood tense-resolve|upbeat|calm] [--bpm 95] [--seed 1]

Moods:
  tense-resolve  minor-key pulse, ticking hats and a sparse motif until --turn, then a warm major
                 resolution with soft plucks (problem -> solution Reels)
  upbeat         bright major progression, plucked arpeggio, light kick and hats throughout
                 (envision / solution Reels)
  calm           slow pads and a gentle arpeggio, no drums (explainers, tips)

The music is deliberately sparse and kept out of the voice's frequency range so narration sits on top.
It always ends on a held final chord that rings out at the end of the video.
"""
import argparse
import wave

import numpy as np

SR = 44100
NOTE = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}


def hz(name, octave):
    return 440.0 * 2 ** ((NOTE[name] + 12 * (octave + 1) - 69) / 12)


def chord(root, quality, octave=3):
    steps = {"min": [0, 3, 7, 10], "maj": [0, 4, 7, 11], "add9": [0, 4, 7, 14], "sus2": [0, 2, 7, 12], "dom": [0, 4, 7, 10]}[quality]
    base = hz(root, octave)
    return [base * 2 ** (s / 12) for s in steps]


class Track:
    def __init__(self, duration, seed):
        self.n = int((duration + 3.0) * SR)
        self.buf = np.zeros((self.n, 2))
        self.rng = np.random.default_rng(seed)

    def add(self, sig, t, gain, pan=0.0):
        i = int(t * SR)
        if i >= self.n:
            return
        sig = sig[: self.n - i]
        a = (pan + 1) * np.pi / 4
        self.buf[i:i + len(sig), 0] += sig * gain * np.cos(a)
        self.buf[i:i + len(sig), 1] += sig * gain * np.sin(a)

    # ---- instruments (all vectorised) ----
    def pad(self, freqs, d, attack=0.6, release=0.8, bright=0.25):
        t = np.arange(int(d * SR)) / SR
        sig = np.zeros_like(t)
        for f in freqs:
            for det in (-0.003, 0.0, 0.004):
                ff = f * (1 + det)
                sig += np.sin(2 * np.pi * ff * t) + bright * np.sin(2 * np.pi * 2 * ff * t) * 0.5 + bright * 0.2 * np.sin(2 * np.pi * 3 * ff * t)
        env = np.minimum(1, t / attack) * np.minimum(1, (d - t) / release).clip(0, 1)
        return sig * env / (len(freqs) * 3)

    def pluck(self, f, d=0.6, decay=7.0):
        t = np.arange(int(d * SR)) / SR
        sig = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 12) + 0.15 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 20)
        return sig * np.minimum(1, t / 0.003) * np.exp(-t * decay)

    def keys(self, f, d=1.4):
        t = np.arange(int(d * SR)) / SR
        sig = sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t * (2.5 + k)) for k, a in ((1, 1.0), (2, 0.4), (3, 0.15), (4, 0.08)))
        return sig * np.minimum(1, t / 0.004)

    def bass(self, f, d):
        t = np.arange(int(d * SR)) / SR
        return (np.sin(2 * np.pi * f * t) + 0.2 * np.sin(2 * np.pi * 2 * f * t)) * np.minimum(1, t / 0.01) * np.exp(-t * 1.6) * np.minimum(1, (d - t) / 0.05).clip(0, 1)

    def kick(self):
        t = np.arange(int(0.35 * SR)) / SR
        f = 45 + 80 * np.exp(-t * 30)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)

    def hat(self, open_=False):
        n = int((0.12 if open_ else 0.04) * SR)
        nz = self.rng.standard_normal(n)
        hp = np.diff(nz, prepend=0)
        hp = np.convolve(hp, np.ones(3) / 3, mode="same")   # take the harsh top off
        t = np.arange(n) / SR
        return hp * np.exp(-t * (25 if open_ else 90)) * 0.12

    def pulse(self, f, d, rate):
        """Low synth pulse: a soft repeating note (tension)."""
        t = np.arange(int(d * SR)) / SR
        gate = (np.sin(2 * np.pi * rate * t) > 0.6).astype(float)
        gate = np.convolve(gate, np.ones(200) / 200, mode="same")
        return np.sin(2 * np.pi * f * t) * gate * 0.9

    def master(self, duration):
        m = self.buf[: int((duration + 0.05) * SR)]
        # keep the voice band clear: gentle dip around 1-3 kHz via a soft high-shelf cut
        side = m - np.vstack([np.convolve(m[:, c], np.ones(6) / 6, mode="same") for c in range(2)]).T
        m = m - 0.5 * side
        peak = np.abs(m).max() or 1
        m = np.tanh(m / peak * 1.4) / np.tanh(1.4) * 0.85
        f = int(0.02 * SR)
        m[:f] *= np.linspace(0, 1, f)[:, None]
        return m


def compose(duration, turn, mood, bpm, seed):
    tr = Track(duration, seed)
    beat = 60 / bpm
    bar = beat * 4
    end_hold = min(3.0, max(1.6, duration * 0.12))
    last_t = max(turn if mood == "tense-resolve" and turn else 0, duration - end_hold)

    if mood == "tense-resolve":
        turn = turn or duration * 0.7
        prog = [("A", "min"), ("F", "maj"), ("D", "min"), ("E", "dom")]
        t, k = 0.0, 0
        while t < turn - 0.05:
            root, q = prog[k % 4]
            d = min(bar, turn - t)
            tr.add(tr.pad(chord(root, q, 3), d + 0.6, attack=0.4, release=0.5, bright=0.15), t, 0.55)
            tr.add(tr.bass(hz(root, 2), d), t, 0.5)
            tr.add(tr.pulse(hz(root, 2) * 2, d, rate=bpm / 60 * 2), t, 0.12)
            for s in range(int(d / (beat / 2))):
                tr.add(tr.hat(open_=(s % 4 == 3)), t + s * beat / 2, 0.55 if s % 2 else 0.35, 0.3)
            # sparse minor motif on beat 1 and the "and" of 3
            motif = {"A": ("E", 5), "F": ("C", 5), "D": ("A", 4), "E": ("G#", 4)}[root]
            tr.add(tr.keys(hz(*motif)), t, 0.22, -0.2)
            if d > beat * 2.6:
                tr.add(tr.keys(hz(*motif) * 2 ** (-2 / 12)), t + beat * 2.5, 0.14, -0.2)
            t += bar
            k += 1
        # resolution: warm major, held to the end
        res = duration - turn + 2.5
        tr.add(tr.pad(chord("C", "add9", 3), res, attack=0.25, release=1.8, bright=0.3), turn, 0.75)
        tr.add(tr.bass(hz("C", 2), min(res, 4)), turn, 0.6)
        arp = [hz(n, o) for n, o in (("C", 5), ("E", 5), ("G", 5), ("D", 6), ("G", 5), ("E", 5))]
        s = 0
        while turn + 0.3 + s * beat / 2 < duration - 0.8:
            tr.add(tr.pluck(arp[s % len(arp)]), turn + 0.3 + s * beat / 2, 0.16, 0.3 if s % 2 else -0.3)
            s += 1
    elif mood == "upbeat":
        prog = [("C", "add9"), ("G", "sus2"), ("A", "min"), ("F", "maj")]
        t, k = 0.0, 0
        while t < last_t - 0.05:
            root, q = prog[k % 4]
            d = min(bar, last_t - t)
            notes = chord(root, q, 4)
            tr.add(tr.pad(chord(root, q, 3), d + 0.5, attack=0.3, release=0.5), t, 0.4)
            tr.add(tr.bass(hz(root, 2), d), t, 0.45)
            for s in range(int(d / (beat / 2))):
                tt = t + s * beat / 2
                tr.add(tr.pluck(notes[(s * 2) % len(notes)] * (2 if s % 4 == 3 else 1), 0.5, 9), tt, 0.14, 0.3 if s % 2 else -0.3)
                tr.add(tr.hat(), tt, 0.3 if s % 2 else 0.18, 0.25)
            for b in range(int(d / beat)):
                if b % 2 == 0:
                    tr.add(tr.kick(), t + b * beat, 0.5)
            t += bar
            k += 1
        tr.add(tr.pad(chord("C", "add9", 3), end_hold + 2.5, attack=0.15, release=1.8, bright=0.3), last_t, 0.6)
        tr.add(tr.bass(hz("C", 2), end_hold), last_t, 0.5)
    else:  # calm
        prog = [("D", "sus2"), ("A", "sus2"), ("B", "min"), ("G", "add9")]
        t, k = 0.0, 0
        while t < last_t - 0.05:
            root, q = prog[k % 4]
            d = min(bar * 2, last_t - t)
            tr.add(tr.pad(chord(root, q, 3), d + 0.8, attack=0.9, release=1.0, bright=0.2), t, 0.5)
            notes = chord(root, q, 4)
            for s in range(int(d / beat)):
                tr.add(tr.pluck(notes[s % len(notes)], 0.9, 5), t + s * beat, 0.1, -0.3 + 0.2 * (s % 4))
            t += bar * 2
            k += 1
        tr.add(tr.pad(chord("D", "add9", 3), end_hold + 2.5, attack=0.4, release=2.0), last_t, 0.6)
    return tr.master(duration)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    ap.add_argument("--duration", type=float, required=True)
    ap.add_argument("--turn", type=float)
    ap.add_argument("--mood", default="tense-resolve", choices=["tense-resolve", "upbeat", "calm"])
    ap.add_argument("--bpm", type=float, default=95)
    ap.add_argument("--seed", type=int, default=1)
    a = ap.parse_args()
    m = compose(a.duration, a.turn, a.mood, a.bpm, a.seed)
    w = wave.open(a.out, "wb")
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(m, -1, 1) * 32767).astype("<i2").tobytes())
    w.close()
    print(f"Wrote {a.out}: {a.mood}, {a.duration}s" + (f", turn at {a.turn}s" if a.turn else ""))


if __name__ == "__main__":
    main()
