"""Generate voice lines with Kokoro TTS -> audio/vo/<id>_raw.wav.
A '|' in the text splits the line into parts joined by a dramatic pause.
Writes audio/vo/segments.json with per-part [start,end] (seconds, after trimming)."""
import json, sys, os
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
mdir = sys.argv[1]
k = Kokoro(os.path.join(mdir, "kokoro-v1.0.int8.onnx"), os.path.join(mdir, "voices-v1.0.bin"))
lines = json.load(open(os.path.join(root, "lines.json")))
PAUSE = 0.38

def trim(x, sr, thr=0.012):
    a = np.abs(x); idx = np.where(a > thr)[0]
    if len(idx) == 0: return x
    s = max(0, idx[0] - int(0.02 * sr)); e = min(len(x), idx[-1] + int(0.06 * sr))
    return x[s:e]

segs = {}
for L in lines:
    parts = [p.strip() for p in L["text"].split("|")]
    out, t, spans = [], 0.0, []
    for i, p in enumerate(parts):
        s, sr = k.create(p, voice=L["voice"], speed=L["speed"], lang="en-us")
        s = trim(np.asarray(s, dtype=np.float32), sr)
        spans.append([round(t, 3), round(t + len(s) / sr, 3), p])
        out.append(s); t += len(s) / sr
        if i < len(parts) - 1:
            out.append(np.zeros(int(PAUSE * sr), np.float32)); t += PAUSE
    y = np.concatenate(out)
    sf.write(os.path.join(root, "audio/vo", L["id"] + "_raw.wav"), y, sr)
    segs[L["id"]] = {"dur": round(len(y) / sr, 3), "parts": spans}
    print(L["id"], L["who"], f"{len(y)/sr:.2f}s")
json.dump(segs, open(os.path.join(root, "audio/vo/segments.json"), "w"), indent=1)
