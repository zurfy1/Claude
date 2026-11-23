#!/usr/bin/env bash
# render in chunks (a failure only loses one chunk), then concat
cd "$(dirname "$0")/../../engine"; OUT=../02-videos/sparta/out; GL=$(cat ../.gl-flag)
for r in "0-549" "550-1099" "1100-1654"; do
  f=$OUT/part_${r}.mp4; [ -s "$f" ] && continue
  for try in 1 2; do npx remotion render SpartaMyth "$f" --gl=$GL --concurrency=4 --muted --log=error --timeout=180000 --frames=$r >> $OUT/render.log 2>&1 && break; done
  echo "chunk $r done: $(ls -la $f 2>/dev/null | awk '{print $5}')"
done
