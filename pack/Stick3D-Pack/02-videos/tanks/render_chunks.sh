#!/usr/bin/env bash
# render in chunks (a failure only loses one chunk), then concat
cd "$(dirname "$0")/../../engine"; OUT=../02-videos/tanks/out; GL=$(cat ../.gl-flag)
for r in "0-649" "650-1299" "1300-1936"; do
  f=$OUT/part_${r}.mp4; [ -s "$f" ] && continue
  for try in 1 2; do npx remotion render TankParts "$f" --gl=$GL --concurrency=4 --muted --log=error --timeout=180000 --frames=$r >> $OUT/render.log 2>&1 && break; done
  echo "chunk $r done: $(ls -la $f 2>/dev/null | awk '{print $5}')"
done
