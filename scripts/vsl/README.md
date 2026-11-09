# SyncEstate VSL pipeline

Builds the 16:9 video sales letter shown on the SyncEstate landing page and on the
LayerSync website's SyncEstate page.

Outputs (committed):

- `public/landing/vsl/sync-estate-vsl.mp4`: 1920×1080, 30 fps, H.264 + AAC, `+faststart`
- `public/landing/vsl/sync-estate-vsl-poster.jpg`: the poster frame (the reveal)
- `public/landing/vsl/sync-estate-vsl.vtt`: captions, only for the narrated cut
- an identical copy of each in `../LayerSyncWeb/public/vsl/` when that repo sits next to this one

## Re-render (one command)

```bash
bash scripts/vsl/build.sh
```

That renders the **muted cut**: phrase timings are synthesised from `script.json`
(2.6 words a second plus each phrase's gap, end card held 4.6 s), and the sound is the
in-house music bed plus sound effects. Takes about 5–10 minutes. Intermediates go to a
temp folder (or `--work <dir>`); options `--fps 30 --crf 24`.

Needs node with the preinstalled Playwright Chromium (`require("playwright")`), python3 with
numpy, and ffmpeg.

## Adding Jesse's voiceover

1. In ElevenLabs, open the flow **"Sync Estate VSL - landing page"** (`BtxBp3rO54XRrKARAAVP`)
   and generate speech with voice **Jesse - Confident, Warm, Expressive Male**
   (`sXcl1NoQHcU7NRh6Na5D`), model `eleven_multilingual_v2`, one take. The prompt is the 20
   lines of `script.md` joined with `<break time="0.6s" />` (0.7–0.8s at scene changes).
   The first attempt on 2026-11-07 failed on the account's billing, so the node is there
   but empty.
2. Download the take (mp3) and run:

   ```bash
   bash scripts/vsl/build.sh --vo path/to/jesse.mp3
   ```

   This runs `audio/vo_split.py` with `--names` in script order to cut the take into its
   20 phrases and write `timeline.json`, re-renders every scene to that timing, mixes with
   `audio/mix.py --vo` (voice on top, music ducked under it, effects lower), and writes the
   WebVTT captions with `captions.mjs`.

   If vo_split reports a different phrase count, a pause inside a phrase was long enough to
   look like a break: re-run it by hand with a larger `--min-pause` (see the script's help).

## Files

| File | What it does |
|---|---|
| `script.json` / `script.md` | The 20 phrases, their names and the synthetic-timing gaps |
| `timeline.mjs` | Synthetic timeline from the script; validates a VO timeline |
| `vsl.html` | Every scene. `window.vsl.seek(t)` sets the frame at time t, nothing runs on a clock |
| `render.mjs` | Playwright: screenshots each frame into ffmpeg; also writes the sound-effect cues and stills (`--stills 12.5,40 --stills-dir out`) |
| `captions.mjs` | WebVTT from a timeline |
| `build.sh` | The whole pipeline |
| `audio/` | `compose.py`, `sfx.py`, `mix.py`, `vo_split.py` from the LayerSync motion studio, and `music.py` (tense until the reveal, then upbeat) |
| `fonts/` | Geist and Geist Mono (SIL Open Font License) |

To change a scene, edit `vsl.html` and check stills before a full render:

```bash
node scripts/vsl/render.mjs --stills 5,40,90 --stills-dir /tmp/vsl-stills
```

Element timing is written against phrases (`data-in="crm@0.4"` = 40% through the crm
line), so scenes follow the voiceover automatically when its timing changes.
