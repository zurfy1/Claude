#!/bin/bash
# tools/render_all.sh <scale> <workers> <outname>  — parallel render + concat + mux audio
set -e
cd "$(dirname "$0")/.."
SCALE=${1:-1}; W=${2:-3}; NAME=${3:-final}
TOTAL=1704   # 71.0 s * 24 fps
mkdir -p out/parts; rm -f out/parts/${NAME}_*.mp4
per=$(( (TOTAL + W - 1) / W ))
for k in $(seq 0 $((W-1))); do
  a=$((k*per)); b=$(( (k+1)*per )); [ $b -gt $TOTAL ] && b=$TOTAL
  node tools/render.cjs out/parts/${NAME}_$k.mp4 $a $b $SCALE > out/parts/${NAME}_$k.log 2>&1 &
done
wait
ls out/parts/${NAME}_*.mp4 | sort -V | sed "s#^#file '$PWD/#;s#\$#'#" > out/parts/${NAME}_list.txt
ffmpeg -v error -y -f concat -safe 0 -i out/parts/${NAME}_list.txt -c copy out/parts/${NAME}_video.mp4
ffmpeg -v error -y -i out/parts/${NAME}_video.mp4 -i audio/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart out/${NAME}.mp4
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height -of compact out/${NAME}.mp4
