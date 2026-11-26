# DON'T LOOK UP — 71 s vertical horror Short (1080×1920, 24 fps)

Original POV story in the "rules from an unknown number" format: a library lockdown,
five texted rules, a crawl to the book-return chute, and a twist in the basement.
Everything is generated in code — no stock footage, no AI video.

## Pipeline
| Step | Command | Output |
|---|---|---|
| Voices (Kokoro TTS, local) | `python3 tools/tts.py <kokoro-model-dir>` | `audio/vo/*_raw.wav`, `segments.json` |
| Character voice FX | `tools/vofx.sh` | `audio/vo/L*.wav` |
| Caption + lip-sync timeline | `python3 tools/build_timeline.py` | `web/timeline.json` |
| Music + SFX + mix | `python3 tools/mix.py` then ffmpeg `loudnorm=I=-14` | `audio/mix.wav` |
| Serve the scene | `cd web && python3 -m http.server 8765` | |
| Test stills | `node tools/stills.cjs <dir> 1.0,8.5,33 0.4` | PNGs |
| Full render | `tools/render_all.sh 1 3 final` | `out/final.mp4` |

`lines.json` holds the script (speaker, text, caption, highlighted words, start time).
`web/main.js` is the shot list (`SHOTS`), one function per shot; `web/lib/` has the
toon renderer helpers, character rigs and the library/tunnel/basement sets.
