#!/usr/bin/env bash
# Builds the SyncEstate VSL end to end: timeline -> picture -> music + sound effects
# (+ voiceover) -> mix -> poster (+ captions) -> copies into the two websites.
#
#   bash scripts/vsl/build.sh                 # muted cut: synthetic timing, music + effects
#   bash scripts/vsl/build.sh --vo jesse.mp3  # narrated cut: timing from the voiceover
#
# Options: --fps 30  --crf 24  --work <dir for intermediates>
# Needs: node + the preinstalled Playwright Chromium, python3 + numpy, ffmpeg.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
VO=""
FPS=30
CRF=24
WORK=""
while [ $# -gt 0 ]; do
  case "$1" in
    --vo) VO="$(cd "$(dirname "$2")" && pwd)/$(basename "$2")"; shift 2 ;;
    --fps) FPS="$2"; shift 2 ;;
    --crf) CRF="$2"; shift 2 ;;
    --work) WORK="$2"; shift 2 ;;
    *) echo "unknown option $1"; exit 1 ;;
  esac
done
WORK="${WORK:-$(mktemp -d)}"
mkdir -p "$WORK"
echo "Working in $WORK"

# 1. Timeline
if [ -n "$VO" ]; then
  NAMES=$(node -e 'const s=require(process.argv[1]); console.log(s.phrases.map(p=>p.name).join(","))' "$HERE/script.json")
  GAPS=$(node -e 'const s=require(process.argv[1]); console.log(s.phrases.filter(p=>p.gap).map(p=>p.name+"="+p.gap).join(","))' "$HERE/script.json")
  python3 "$HERE/audio/vo_split.py" "$VO" "$WORK/vo_tight.wav" "$WORK/timeline.json" \
    --names "$NAMES" --gaps "$GAPS" --default-gap 0.5 --tail 4.6
else
  node "$HERE/timeline.mjs" "$WORK/timeline.json"
fi
DUR=$(node -e 'console.log(require(process.argv[1])._duration)' "$WORK/timeline.json")
TURN=$(node -e 'const t=require(process.argv[1]); console.log((t.reveal[0]-0.45).toFixed(2))' "$WORK/timeline.json")
POSTER_T=$(node -e 'const t=require(process.argv[1]); const [s,e]=t.reveal; console.log((s+0.92*(e-s)).toFixed(2))' "$WORK/timeline.json")

# 2. Picture (and the sound-effect cue list)
node "$HERE/render.mjs" --timeline "$WORK/timeline.json" --out "$WORK/silent.mp4" \
  --events "$WORK/sfx-board.json" --fps "$FPS" --crf "$CRF"

# 3. Music and sound effects
python3 "$HERE/audio/music.py" "$WORK/music.wav" --duration "$DUR" --turn "$TURN" --bpm 98
python3 - "$HERE/audio" "$WORK/sfx-board.json" "$WORK/sfx.wav" <<'PY'
import json, sys
sys.path.insert(0, sys.argv[1])
import sfx
board = json.load(open(sys.argv[2]))
times = sfx.build(board, sys.argv[3])
print(f"sound effects: {len(times)} cues")
for a, b in sfx.silent_gaps(times, board["duration"]):
    print(f"SOUND GAP: nothing from {a:.1f}s to {b:.1f}s")
PY

# 4. Mix
OUT_DIR="$ROOT/public/landing/vsl"
mkdir -p "$OUT_DIR"
if [ -n "$VO" ]; then
  python3 "$HERE/audio/mix.py" "$WORK/silent.mp4" "$WORK/mixed.mp4" \
    --vo "$WORK/vo_tight.wav" --music "$WORK/music.wav" --sfx "$WORK/sfx.wav"
  node "$HERE/captions.mjs" "$WORK/timeline.json" > "$OUT_DIR/sync-estate-vsl.vtt"
else
  # No narration: the music carries the piece, effects sit underneath.
  python3 "$HERE/audio/mix.py" "$WORK/silent.mp4" "$WORK/mixed.mp4" \
    --music "$WORK/music.wav" --sfx "$WORK/sfx.wav" --music-level 0.55 --sfx-level 0.32
  rm -f "$OUT_DIR/sync-estate-vsl.vtt"
fi
# mix.py writes 192 kb/s audio; 128 kb/s is plenty for the web and keeps the file small.
ffmpeg -loglevel error -y -i "$WORK/mixed.mp4" -map 0 -c:v copy -c:a aac -b:a 128k -movflags +faststart "$OUT_DIR/sync-estate-vsl.mp4"

# 5. Poster: the reveal (logo, headline and the phone)
node "$HERE/render.mjs" --timeline "$WORK/timeline.json" --stills "$POSTER_T" --stills-dir "$WORK/poster" >/dev/null
ffmpeg -loglevel error -y -i "$WORK"/poster/still-*.png -q:v 5 "$OUT_DIR/sync-estate-vsl-poster.jpg"

# 6. The LayerSync website carries an identical copy
LSW="$ROOT/../LayerSyncWeb/public/vsl"
if [ -d "$ROOT/../LayerSyncWeb" ]; then
  mkdir -p "$LSW"
  cp "$OUT_DIR"/sync-estate-vsl.mp4 "$OUT_DIR"/sync-estate-vsl-poster.jpg "$LSW/"
  if [ -f "$OUT_DIR/sync-estate-vsl.vtt" ]; then cp "$OUT_DIR/sync-estate-vsl.vtt" "$LSW/"; else rm -f "$LSW/sync-estate-vsl.vtt"; fi
fi

ls -la "$OUT_DIR"
ffprobe -v error -show_entries format=duration,size -of default=nw=1 "$OUT_DIR/sync-estate-vsl.mp4"
