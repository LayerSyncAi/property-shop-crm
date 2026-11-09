#!/usr/bin/env python3
# Copied unchanged from the LayerSync motion studio skill (scripts/mix.py) so this pipeline is self-contained.
"""Mix a voiceover, a music bed and the sound-effects track under a silent Reel.

Usage:
  python mix.py silent.mp4 out.mp4 [--vo vo.wav] [--music music.wav] [--sfx sfx.wav]
                [--music-level 0.30] [--music-duck 0.12] [--sfx-level 0.45]

- The voice sits on top. The music plays at --music-level and dips to --music-duck whenever the voice
  speaks (smooth 120 ms attack, 350 ms release). Sound effects play at --sfx-level.
- Music longer than the video is trimmed with a 1.5 s fade-out; shorter music fades out where it ends.
- The final mix is loudness-normalised to about -14 LUFS (true peak -1.5 dB), which suits Instagram,
  Facebook and WhatsApp.
"""
import argparse
import os
import subprocess
import tempfile
import wave

import numpy as np

SR = 44100


def load(path, duration):
    """Any audio file -> stereo float array at 44.1 kHz, padded or cut to the video length."""
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, "a.wav")
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", path, "-ar", str(SR), "-ac", "2", wav], check=True)
        w = wave.open(wav)
        a = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(float).reshape(-1, 2) / 32768
    n = int(duration * SR)
    out = np.zeros((n, 2))
    out[: min(n, len(a))] = a[:n]
    return out, len(a) / SR


def envelope(x, attack=0.12, release=0.35):
    """Smoothed loudness envelope of the voice, 0..1, used to duck the music."""
    mono = np.abs(x).mean(axis=1)
    win = int(0.03 * SR)
    rms = np.sqrt(np.convolve(mono ** 2, np.ones(win) / win, mode="same"))
    gate = (rms > 0.02).astype(float)
    a = np.exp(-1 / (attack * SR))
    r = np.exp(-1 / (release * SR))
    env = np.empty_like(gate)
    acc = 0.0
    for i, g in enumerate(gate):
        coef = a if g > acc else r
        acc = coef * acc + (1 - coef) * g
        env[i] = acc
    return env


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("out")
    ap.add_argument("--vo")
    ap.add_argument("--music")
    ap.add_argument("--sfx")
    ap.add_argument("--music-level", type=float, default=0.30)
    ap.add_argument("--music-duck", type=float, default=0.12)
    ap.add_argument("--sfx-level", type=float, default=0.45)
    a = ap.parse_args()

    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                         "-of", "csv=p=0", a.video]).decode().strip())
    n = int(dur * SR)
    mix = np.zeros((n, 2))
    voice = np.zeros((n, 2))
    if a.vo:
        voice, _ = load(a.vo, dur)
        voice = voice / max(1e-6, np.abs(voice).max()) * 0.75
        mix += voice
    if a.music:
        music, mlen = load(a.music, dur)
        music = music / max(1e-6, np.abs(music).max())
        end = min(dur, mlen)
        fade = int(1.5 * SR)
        e = int(end * SR)
        music[max(0, e - fade): e] *= np.linspace(1, 0, min(fade, e))[:, None]
        music[e:] = 0
        gain = a.music_level - (a.music_level - a.music_duck) * envelope(voice) if a.vo else np.full(n, a.music_level)
        mix += music * gain[:, None]
    if a.sfx:
        sfx, _ = load(a.sfx, dur)
        sfx = sfx / max(1e-6, np.abs(sfx).max())
        mix += sfx * a.sfx_level
    mix = np.tanh(mix * 1.1) / np.tanh(1.1)

    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, "mix.wav")
        w = wave.open(wav, "wb")
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(mix, -1, 1) * 32767).astype("<i2").tobytes())
        w.close()
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", a.video, "-i", wav, "-map", "0:v", "-map", "1:a",
                        "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.66:level=false:attack=1:release=60", "-ar", str(SR), "-c:a", "aac",
                        "-b:a", "192k", "-shortest", "-movflags", "+faststart", a.out], check=True)
    print(f"Wrote {a.out} ({dur:.1f}s): voice{' + music' if a.music else ''}{' + sound effects' if a.sfx else ''}")


if __name__ == "__main__":
    main()
