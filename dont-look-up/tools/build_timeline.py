"""lines.json + audio/vo -> web/timeline.json (word timings for captions, mouth envelopes)."""
import json, os, re
import numpy as np, soundfile as sf
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 24
lines = json.load(open(os.path.join(root, "lines.json")))
segs = json.load(open(os.path.join(root, "audio/vo/segments.json")))
out = []
for L in lines:
    seg = segs[L["id"]]
    cap_parts = L["cap"].split("|")
    parts = seg["parts"]
    assert len(cap_parts) == len(parts), L["id"]
    words = []
    for cp, (a, b, _) in zip(cap_parts, parts):
        ws = cp.split()
        w8 = [max(2, len(re.sub(r"[^A-Za-z]", "", w))) + 1.5 for w in ws]
        tot = sum(w8); t = a
        for w, k in zip(ws, w8):
            d = (b - a) * k / tot
            words.append({"w": w, "t": round(L["start"] + t, 3), "hl": w in L.get("hl", [])})
            t += d
    y, sr = sf.read(os.path.join(root, "audio/vo", L["id"] + ".wav"))
    hop = sr // FPS
    env = [float(np.sqrt(np.mean(y[i:i + hop] ** 2))) for i in range(0, len(y), hop)]
    m = max(env) or 1
    env = [round(min(1, e / m * 1.3), 2) for e in env]
    dur = len(y) / sr
    if L["who"] == "THING":
        for w in words: w["t"] = round(L["start"] + (w["t"] - L["start"]) / 0.74, 3)
    out.append({"id": L["id"], "who": L["who"], "start": L["start"], "end": round(L["start"] + seg["dur"], 3),
                "dur": round(dur, 3), "words": words, "env": env})
json.dump({"fps": FPS, "lines": out}, open(os.path.join(root, "web/timeline.json"), "w"))
for o in out: print(o["id"], o["start"], o["end"], " ".join(w["w"] for w in o["words"]))
