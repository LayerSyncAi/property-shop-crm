#!/usr/bin/env python3
# Copied unchanged from the LayerSync motion studio skill (scripts/sfx.py) so this pipeline is self-contained.
"""Sound design for LayerSync Reels: original, synthesised sound effects placed from the storyboard.

Every sound is generated here (no samples, no licensing). build(board) reads the storyboard and puts a
fitting sound on each animation: a whoosh and impact on a hook slam, a pop when a card lands, clicks for
typing, chimes for incoming messages, a sweep for a line drawing, a warm chord on the end card.

Storyboard controls (all optional):
  top level:  "sfx": false (silent video) · "sfx_level": 1.0 (overall volume)
              "sfx_events": [{"t": 4.2, "sound": "thud", "gain": 0.4, "pan": 0}]  (extra hand-placed sounds)
  scene:      "sfx": false (no transition sound for this scene)
  element:    "sfx": false (silent element) · "sfx": "<sound name>" (override) · "sfx_gain": 0.5

Sound names: whoosh, whoosh_up, whoosh_down, swell, impact, thud, pop, pop_up, click, notif, sent,
bell, chime, chord, chord_resolve, error, sweep, marimba, riser, snap.

Usage: python sfx.py storyboard.json out.wav
"""
import hashlib
import json
import sys
import wave

import numpy as np

SR = 44100


# ------------------------------------------------------------------ building blocks

def t_(d):
    return np.arange(int(d * SR)) / SR


def env(n, attack=0.002, decay=8.0):
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-t * decay)


def lowpass(x, fc):
    """One-pole low-pass with a (possibly time-varying) cutoff."""
    fc = np.broadcast_to(np.asarray(fc, dtype=float), x.shape)
    a = np.exp(-2 * np.pi * np.clip(fc, 20, SR / 2.2) / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


class Kit:
    def __init__(self, seed):
        self.rng = np.random.default_rng(seed)

    def noise(self, n):
        return self.rng.standard_normal(n)

    def click(self, pitch=1.0):
        n = int(0.012 * SR)
        nz = self.noise(n)
        hp = nz - lowpass(nz, 2500 * pitch)
        t = np.arange(n) / SR
        tone = np.sin(2 * np.pi * 3200 * pitch * t) * 0.3
        return (hp + tone) * env(n, 0.0003, 420)

    def pop(self, f0=700, f1=180, d=0.09):
        t = t_(d)
        f = np.geomspace(f0, f1, len(t))
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 35)

    def whoosh(self, d=0.6, f0=300, f1=3000):
        n = int(d * SR)
        nz = self.noise(n)
        fc = np.geomspace(f0, f1, n)
        y = lowpass(nz, fc) - lowpass(nz, fc * 0.35)
        return y * np.hanning(n) ** 1.5 * 1.9

    def bell(self, f, d=0.8, dec=6.0, bright=0.3):
        t = t_(d)
        y = np.sin(2 * np.pi * f * t) + bright * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t * dec * 2)
        return y * env(len(t), 0.002, dec)

    def chord(self, fs, d=2.5, dec=1.6):
        return sum(self.bell(f, d, dec, 0.25) for f in fs) / len(fs)

    def notif(self):
        a = self.bell(1318.5, 0.35, 14, 0.2)
        b = self.bell(1760.0, 0.5, 10, 0.2)
        out = np.zeros(int(0.6 * SR))
        out[: len(a)] += a
        o = int(0.09 * SR)
        out[o: o + len(b)] += b
        return out * 0.8

    def thud(self):
        t = t_(0.6)
        s = np.sin(2 * np.pi * 55 * t + 3 * np.exp(-t * 30)) * env(len(t), 0.002, 7)
        nz = lowpass(self.noise(len(t)), 400) * env(len(t), 0.001, 18)
        return s + nz * 1.5

    def impact(self):
        """Lighter hit for text slams: low thump plus a short bright transient."""
        t = t_(0.35)
        body = np.sin(2 * np.pi * 90 * t + 2 * np.exp(-t * 40)) * env(len(t), 0.001, 14)
        top = self.click(0.8)
        out = body * 0.9
        out[: len(top)] += top * 0.6
        return out

    def error(self):
        """Two falling tones for a loss or failure (alert pills)."""
        a = self.pop(520, 360, 0.14)
        b = self.pop(390, 240, 0.2)
        out = np.zeros(int(0.42 * SR))
        out[: len(a)] += a
        o = int(0.15 * SR)
        out[o: o + len(b)] += b
        return out * 0.8

    def sweep(self, f0=330, f1=990, d=0.8):
        t = t_(d)
        f = np.geomspace(f0, f1, len(t))
        ph = 2 * np.pi * np.cumsum(f) / SR
        return (np.sin(ph) + 0.25 * np.sin(2 * ph)) * np.sin(np.pi * np.linspace(0, 1, len(t))) ** 2

    def marimba(self, f):
        t = t_(0.5)
        return (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 40)) * env(len(t), 0.001, 9)

    def riser(self, d=1.5):
        n = int(d * SR)
        nz = self.noise(n)
        fc = np.geomspace(200, 5000, n)
        y = lowpass(nz, fc) - lowpass(nz, fc * 0.4)
        e = np.linspace(0, 1, n) ** 2.2
        tone = np.sin(2 * np.pi * np.cumsum(np.geomspace(110, 440, n)) / SR) * e * 0.3
        return y * e + tone

    def snap(self, f=1200):
        t = t_(0.12)
        out = np.sin(2 * np.pi * f * t) * env(len(t), 0.0005, 55) * 0.8
        c = self.click(1.4)
        out[: len(c)] += c * 0.6
        return out

    # Named sounds used by the mapper and by "sfx" overrides.
    def named(self, name, **kw):
        r = self.rng
        table = {
            "whoosh": lambda: self.whoosh(0.5, 250, 2200),
            "whoosh_up": lambda: self.whoosh(0.7, 200, 4500),
            "whoosh_down": lambda: self.whoosh(0.7, 3500, 200),
            "swell": lambda: self.whoosh(1.1, 200, 900),
            "impact": self.impact,
            "thud": self.thud,
            "pop": lambda: self.pop(r.uniform(560, 760), 170, 0.09),
            "pop_up": lambda: self.pop(600, 1100, 0.09),
            "click": lambda: self.click(r.uniform(0.85, 1.15)),
            "notif": self.notif,
            "sent": lambda: self.pop(700, 1300, 0.08),
            "bell": lambda: self.bell(kw.get("f", 1318.5), 0.8, 7),
            "chime": lambda: self.bell(kw.get("f", 1760.0), 0.5, 10),
            "chord": lambda: self.chord([523.3, 659.3, 784.0, 1046.5], 3.0, 1.2),
            "chord_resolve": lambda: self.chord([392.0, 523.3, 659.3, 784.0, 1046.5], 3.5, 0.9),
            "error": self.error,
            "sweep": lambda: self.sweep(330, 990, kw.get("d", 0.8)),
            "marimba": lambda: self.marimba(kw.get("f", 1046.5)),
            "riser": lambda: self.riser(kw.get("d", 1.5)),
            "snap": lambda: self.snap(r.uniform(900, 1400)),
        }
        if name not in table:
            raise ValueError(f"unknown sound '{name}'")
        return table[name]()


# ------------------------------------------------------------------ mixer

class Mix:
    def __init__(self, duration):
        n = int((duration + 0.2) * SR)
        self.L = np.zeros(n)
        self.R = np.zeros(n)

    def put(self, sig, t, gain=0.3, pan=0.0):
        if t < 0:
            sig = sig[int(-t * SR):]
            t = 0
        i = int(t * SR)
        if i >= len(self.L) or len(sig) == 0:
            return
        sig = sig[: len(self.L) - i]
        a = (pan + 1) * np.pi / 4
        self.L[i: i + len(sig)] += sig * gain * np.cos(a)
        self.R[i: i + len(sig)] += sig * gain * np.sin(a)

    def master(self, level=1.0):
        m = np.stack([self.L, self.R], 1)
        peak = np.abs(m).max()
        if peak == 0:
            return m
        m = m / peak * 1.6
        m = np.tanh(m * 1.2) / np.tanh(1.2 * 1.6)   # soft clip / glue
        m = m / np.abs(m).max() * 0.84 * min(level, 1.0)
        fade = int(0.05 * SR)
        m[-fade:] *= np.linspace(1, 0, fade)[:, None]
        return m


def write_wav(m, path):
    w = wave.open(path, "wb")
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(m, -1, 1) * 32767).astype("<i2").tobytes())
    w.close()


# ------------------------------------------------------------------ storyboard -> sound events

def _x_pan(el):
    x = el.get("x", 540)
    return float(np.clip((x - 540) / 540 * 0.6, -0.6, 0.6))


def events_for(board, kit):
    """Return a list of (time, signal, gain, pan)."""
    ev = []
    rng = kit.rng

    def add(t, name, gain, pan=0.0, **kw):
        ev.append((t, kit.named(name, **kw), gain, pan))

    for si, sc in enumerate(board["scenes"]):
        s0 = sc["start"]
        # Scene transitions
        if sc.get("sfx", True) and si > 0:
            tr = sc.get("transition_in", "cut")
            if tr == "circle":
                add(s0 - 0.05, "whoosh_up", 0.30)
            elif tr in ("wipe-up", "wipe-left"):
                add(s0 - 0.05, "whoosh", 0.26, -0.3 if tr == "wipe-left" else 0)
            elif tr == "fade":
                add(s0, "swell", 0.12)
            else:
                add(s0, "whoosh", 0.12)
            if sc.get("background") == "ink" and si == len(board["scenes"]) - 1:
                add(s0 - 0.6, "riser", 0.10, d=0.6)

        for el in sc.get("elements", []):
            if el.get("sfx") is False:
                continue
            en = el.get("enter", {})
            t = s0 + en.get("at", 0)
            dur = en.get("dur", 0.35)
            style = en.get("style", "fade")
            g = el.get("sfx_gain", 1.0)
            pan = _x_pan(el)
            typ = el["type"]

            if isinstance(el.get("sfx"), str):
                add(t, el["sfx"], 0.35 * g, pan)
            elif typ == "text":
                if style == "slam":
                    add(t - 0.12, "whoosh", 0.22 * g)
                    add(t + dur * 0.55, "impact", 0.55 * g)
                elif style == "words":
                    n = len(el["text"].replace("*", "").split())
                    for k in range(n):
                        add(t + dur * k / max(1, n), "click", 0.32 * g, rng.uniform(-0.3, 0.3))
                    add(t + dur, "chime", 0.12 * g, f=1568.0)
                elif style == "type":
                    n = len(el["text"].replace("*", "").replace(" ", ""))
                    for k in range(n):
                        add(t + dur * k / max(1, n), "click", 0.3 * g, rng.uniform(-0.3, 0.3))
                elif style in ("rise", "drop", "slide-left", "slide-right"):
                    add(t - 0.05, "whoosh", 0.14 * g, pan)
                elif style == "pop":
                    add(t, "pop", 0.4 * g, pan)
                elif style == "fade":
                    add(t - 0.1, "swell", 0.10 * g, pan)
            elif typ == "pill":
                fill = el.get("fill", "ink")
                if fill == "alert":
                    add(t + 0.05, "error", 0.45 * g, pan)
                elif fill == "coral":
                    add(t, "pop_up", 0.45 * g, pan)
                    add(t + 0.04, "chime", 0.18 * g, pan)
                else:
                    add(t, "pop", 0.38 * g, pan)
            elif typ in ("window", "card", "sheet", "dashboard"):
                if style == "build" and typ == "window":
                    rows = el.get("rows", [])
                    for k in range(len(rows)):
                        add(t + dur * k / max(1, len(rows)), "pop", 0.32 * g, pan)
                elif style != "none":
                    add(t + 0.02, "pop", 0.42 * g, pan)
                if typ == "window" and el.get("value_at") is not None:
                    rows = el.get("rows", [])
                    for i, row in enumerate(rows):
                        if not isinstance(row, list) or not row[1]:
                            continue
                        if "type_rows" in el and i not in el["type_rows"]:
                            continue
                        t0 = t + el["value_at"] + i * el.get("value_stagger", 0)
                        nchar = len(row[1])
                        for k in range(nchar):
                            add(t0 + el.get("value_dur", 0.5) * k / nchar, "click", 0.45 * g, pan)
                if typ == "dashboard" and el.get("bars"):
                    add(t + 0.2, "sweep", 0.12 * g, pan, d=0.9)
                if el.get("badge"):
                    add(t + 0.25, "notif", 0.2 * g, pan)
            elif typ == "chat":
                if style != "none":
                    add(t, "pop", 0.3 * g, pan)
                for i, m in enumerate(el.get("messages", [])):
                    tm = t + i * el.get("interval", 0.45)
                    if m.get("from") == "out":
                        add(tm, "sent", 0.4 * g, 0.3)
                    else:
                        add(tm, "notif", 0.3 * g, -0.3)
            elif typ == "phone":
                add(t - 0.05, "whoosh", 0.14 * g, pan)
                for i, _ in enumerate(el.get("items", [])):
                    add(t + i * el.get("interval", 0.25), "notif", 0.26 * g, rng.uniform(-0.4, 0.4))
            elif typ == "line":
                if style == "draw":
                    add(t, "sweep", 0.12 * g, 0, d=max(0.3, dur + 0.2))
            elif typ == "checklist":
                notes = [880.0, 1046.5, 1174.7, 1318.5, 1568.0, 1760.0]
                for i, _ in enumerate(el.get("items", [])):
                    add(t + i * el.get("interval", 0.4), "bell", 0.3 * g, pan, f=notes[i % len(notes)])
            elif typ == "counter":
                cd = el.get("count_dur", 1.0)
                scale = [523.3, 587.3, 659.3, 784.0, 880.0, 1046.5, 1174.7, 1318.5]
                for i, f in enumerate(scale):
                    add(t + cd * (i / len(scale)) ** 1.4, "marimba", 0.24 * g, -0.4 + i * 0.1, f=f)
            elif typ == "hub":
                add(t, "pop", 0.45 * g, pan)
                if el.get("pulse"):
                    add(t + 0.15, "chord", 0.18 * g)
            elif typ == "icon":
                add(t, "pop", 0.3 * g, pan)
            elif typ == "endcard":
                add(t - 0.1, "whoosh_up", 0.18 * g)
                add(t + 0.1, "chord_resolve", 0.4 * g)
                if el.get("cta"):
                    add(t + 0.4, "pop_up", 0.4 * g)
            elif typ == "wordmark":
                add(t, "chord_resolve", 0.28 * g)

            # Big moves get a soft whoosh
            for mv in el.get("move", []):
                if "to" in mv:
                    dx = mv["to"][0] - el.get("x", 540)
                    dy = mv["to"][1] - el.get("y", 960)
                    if (dx * dx + dy * dy) ** 0.5 > 100:
                        add(s0 + mv.get("at", 0), "whoosh", 0.10 * g, pan)
            if el.get("exit", {}).get("style") in ("shrink", "slide-left"):
                add(s0 + el["exit"].get("at", 0), "whoosh_down", 0.08 * g, pan)

    for e in board.get("sfx_events", []):
        add(e["t"], e["sound"], e.get("gain", 0.3), e.get("pan", 0.0), **{k: v for k, v in e.items() if k in ("f", "d")})
    return ev


def build(board, out_wav):
    seed = int(hashlib.md5(board.get("id", "reel").encode()).hexdigest()[:8], 16)
    kit = Kit(seed)
    mix = Mix(board["duration"])
    events = events_for(board, kit)
    # Thin out pile-ups: many sounds inside 40 ms get quieter so bursts don't distort.
    times = sorted(e[0] for e in events)
    for t, sig, gain, pan in events:
        crowd = sum(1 for x in times if abs(x - t) < 0.04)
        mix.put(sig, t, gain / max(1.0, crowd ** 0.5), pan)
    write_wav(mix.master(board.get("sfx_level", 1.0)), out_wav)
    return sorted(t for t, *_ in events)


def silent_gaps(times, duration, limit=3.0):
    """Stretches longer than `limit` seconds with no new sound (attention drops in silence)."""
    pts = [0.0] + [t for t in times if 0 <= t <= duration] + [duration]
    return [(a, b) for a, b in zip(pts, pts[1:]) if b - a > limit and b < duration - 0.5]


if __name__ == "__main__":
    b = json.load(open(sys.argv[1], encoding="utf-8"))
    times = build(b, sys.argv[2])
    print(f"Wrote {sys.argv[2]} with {len(times)} sound events")
    for a, c in silent_gaps(times, b["duration"]):
        print(f"SOUND GAP: no new sound from {a:.1f}s to {c:.1f}s")
