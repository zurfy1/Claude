#!/bin/bash
# Character voice processing -> audio/vo/<id>.wav (48 kHz mono)
cd "$(dirname "$0")/../audio/vo"
for f in L*_raw.wav; do
  id=${f%_raw.wav}; who=$(python3 -c "import json;print([l['who'] for l in json.load(open('../../lines.json')) if l['id']=='$id'][0])")
  case $who in
    MAN)   af="asetrate=24000*0.86,aresample=24000,atempo=1.1628,lowpass=f=3800,highpass=f=90,aecho=0.8:0.5:60|140:0.25|0.15,volume=1.6" ;;
    THING) af="asetrate=24000*0.74,aresample=24000,lowpass=f=3000,aecho=0.8:0.7:90|240|500:0.35|0.25|0.18,volume=1.8" ;;
    DEV)   af="highpass=f=110,aecho=0.9:0.4:35:0.12" ;;
    MAYA)  af="highpass=f=120,aecho=0.9:0.4:35:0.12" ;;
    JORDAN) af="highpass=f=140,aecho=0.9:0.4:35:0.12,volume=1.2" ;;
  esac
  ffmpeg -v error -y -i $f -af "$af,aresample=48000" -ac 1 $id.wav
  printf "%s %s %s\n" $id $who $(ffprobe -v error -show_entries format=duration -of csv=p=0 $id.wav)
done
