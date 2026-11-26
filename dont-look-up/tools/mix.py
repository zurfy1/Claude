"""Synthesize music + SFX and mix with the voice lines -> audio/mix.wav (48 kHz stereo).
Everything here is generated from scratch (noise, oscillators, filters)."""
import json, os
import numpy as np, soundfile as sf
from scipy import signal

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
DUR = 71.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
mix = np.zeros((N, 2))
amb = np.zeros((N, 2))    # ambience/music bus (gets ducked under voice)
rvb_send = np.zeros(N)    # mono send to a big reverb

def T(s): return np.arange(int(s * SR)) / SR
def noise(s): return rng.standard_normal(int(s * SR))
def filt(x, kind, f, order=4):
    sos = signal.butter(order, f, btype=kind, fs=SR, output='sos'); return signal.sosfilt(sos, x)
def edecay(s, k): return np.exp(-T(s) * k)
def fade(x, a=0.005, r=0.02):
    n = len(x); ai, ri = int(a * SR), int(r * SR); e = np.ones(n)
    if ai: e[:ai] = np.linspace(0, 1, ai)
    if ri: e[-ri:] *= np.linspace(1, 0, ri)
    return x * e
def place(bus, x, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= len(bus): return
    x = x[: len(bus) - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    bus[i:i + len(x), 0] += x * g * l * 1.414; bus[i:i + len(x), 1] += x * g * r * 1.414
def norm(x): m = np.max(np.abs(x)) or 1; return x / m
def db(d): return 10 ** (d / 20)

# ---------------- recipes ----------------
def thunder(big=True):
    s = 5.0 if big else 4.0
    crack = filt(noise(0.35), 'highpass', 1500) * edecay(0.35, 14) if big else np.zeros(int(0.35 * SR))
    boom = filt(noise(s), 'lowpass', 160) * edecay(s, 0.9)
    rumble = 0.6 + 0.4 * np.abs(filt(noise(s), 'lowpass', 3))  * 6
    boom *= np.clip(rumble, 0, 2)
    out = norm(boom) * 0.9
    out[: len(crack)] += norm(crack) * 0.7
    return fade(out, 0.002, 0.8)
def rain(s):
    hiss = filt(noise(s), 'bandpass', [1200, 7000]) * 0.5
    low = filt(noise(s), 'lowpass', 500) * 0.6
    patter = np.zeros(int(s * SR)); idx = rng.integers(0, len(patter) - 400, int(s * 60))
    for i in idx: patter[i:i + 200] += rng.standard_normal(200) * np.exp(-np.arange(200) / 40) * rng.uniform(0.2, 1)
    patter = filt(patter, 'highpass', 2500)
    return norm(hiss + low + patter * 0.6)
def pad(s, freqs):
    t = T(s); x = sum(np.sin(2 * np.pi * f * t + i) * (0.9 ** i) for i, f in enumerate(freqs))
    x *= 0.8 + 0.2 * np.sin(2 * np.pi * 0.4 * t)
    return fade(norm(filt(x, 'lowpass', 2000)), 1.0, 0.03)
def saw(f, t): return 2 * ((f * t) % 1) - 1
def drone(s, base=55.0):
    t = T(s)
    x = saw(base, t) + saw(base * 1.006, t) + 0.6 * saw(base * 1.5 * 0.997, t) + 1.2 * np.sin(2 * np.pi * base / 2 * t)
    lfo = 250 + 180 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.07 * t))
    # time-varying lowpass via short blocks
    out = np.zeros_like(x); blk = SR // 10; zi = None
    for k in range(0, len(x), blk):
        sos = signal.butter(2, lfo[k], 'lowpass', fs=SR, output='sos')
        if zi is None: zi = signal.sosfilt_zi(sos) * 0
        out[k:k + blk], zi = signal.sosfilt(sos, x[k:k + blk], zi=zi)
    return norm(out)
def tension_high(s):
    t = T(s); x = np.sin(2 * np.pi * 1174.7 * t) + np.sin(2 * np.pi * 1244.5 * t) + 0.5 * np.sin(2 * np.pi * 1661 * t)
    return norm(x * (0.5 + 0.5 * np.sin(2 * np.pi * 0.11 * t - 1.5)))
def heartbeat():
    def thump(g):
        t = T(0.18); f = 70 * np.exp(-t * 12) + 35
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 22) * g
    x = np.zeros(int(0.6 * SR)); a = thump(1.0); b = thump(0.7)
    x[: len(a)] += a; i = int(0.22 * SR); x[i:i + len(b)] += b
    return x
def hit(s=2.5):
    t = T(s); f = 60 * np.exp(-t * 4) + 32
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
    n = filt(noise(s), 'lowpass', 900) * np.exp(-t * 9)
    return norm(sub * 1.0 + n * 0.5)
def braam(s=2.4, base=41.2):
    t = T(s); x = sum(saw(base * m, t) for m in (1, 1.498, 2.0, 2.38))
    x = np.tanh(filt(x, 'lowpass', 700) * 2.5) * np.minimum(1, t / 0.04) * np.exp(-t * 1.3)
    return norm(x)
def door_bang():
    t = T(1.2); thud = np.sin(2 * np.pi * np.cumsum(90 * np.exp(-t * 6) + 40) / SR) * np.exp(-t * 9)
    crack = filt(noise(1.2), 'bandpass', [300, 3000]) * np.exp(-t * 25)
    rattle = filt(noise(1.2), 'bandpass', [2000, 6000]) * np.exp(-t * 6) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 23 * t)))
    return norm(thud + crack * 0.8 + rattle * 0.25)
def step():
    t = T(0.16); x = filt(noise(0.16), 'lowpass', 700) * np.exp(-t * 40) + np.sin(2 * np.pi * 85 * t) * np.exp(-t * 35) * 0.8
    return norm(x)
def jingle(s=0.9):
    x = np.zeros(int(s * SR))
    for _ in range(int(s * 18)):
        i = rng.integers(0, len(x) - 6000); t = T(6000 / SR); f0 = rng.uniform(2800, 6500)
        ping = sum(np.sin(2 * np.pi * f0 * r * t) for r in (1, 1.47, 2.09)) * np.exp(-t * rng.uniform(25, 45))
        x[i:i + len(ping)] += ping * rng.uniform(0.3, 1)
    return norm(x)
def ding():
    t = T(1.0); x = (np.sin(2 * np.pi * 1318.5 * t) + 0.6 * np.sin(2 * np.pi * 2637 * t)) * np.exp(-t * 5)
    t2 = T(1.0); y = (np.sin(2 * np.pi * 1760 * t2) + 0.5 * np.sin(2 * np.pi * 3520 * t2)) * np.exp(-t2 * 4)
    out = np.zeros(int(1.2 * SR)); out[: len(x)] += x; out[int(0.12 * SR): int(0.12 * SR) + len(y)] += y
    return norm(out)
def buzz(pulses=2, gap=0.55, plen=0.38):
    out = np.zeros(int((pulses * gap + 0.3) * SR))
    for k in range(pulses):
        t = T(plen); x = np.sign(np.sin(2 * np.pi * 165 * t)) * (0.6 + 0.4 * np.sin(2 * np.pi * 30 * t))
        x = filt(x, 'lowpass', 1200) * np.minimum(1, t / 0.01) * np.minimum(1, (plen - t) / 0.03)
        i = int(k * gap * SR); out[i:i + len(x)] += x
    return norm(out)
def whoosh(s=0.8, f0=300, f1=3000):
    x = noise(s); out = np.zeros_like(x); blk = SR // 50; zi = None
    fc = np.geomspace(f0, f1, len(x))
    for k in range(0, len(x), blk):
        sos = signal.butter(2, [fc[k] * 0.7, fc[k] * 1.3], 'bandpass', fs=SR, output='sos')
        if zi is None: zi = signal.sosfilt_zi(sos) * 0
        out[k:k + blk], zi = signal.sosfilt(sos, x[k:k + blk], zi=zi)
    return norm(out * np.sin(np.pi * np.linspace(0, 1, len(out))) ** 2)
def slide(s=1.9):
    t = T(s); x = filt(noise(s), 'bandpass', [250, 900]) * (0.6 + 0.4 * np.sin(2 * np.pi * 13 * t))
    clanks = np.zeros_like(x)
    for c in np.linspace(0.2, s - 0.35, 7):
        i = int(c * SR); tt = T(0.3); k = sum(np.sin(2 * np.pi * f * tt) for f in (523, 811, 1307)) * np.exp(-tt * 18); clanks[i:i + len(k)] += k
    return norm(x * np.minimum(1, t / 0.2) + clanks * 0.5)
def book_thud():
    t = T(1.0); x = np.sin(2 * np.pi * np.cumsum(70 * np.exp(-t * 8) + 35) / SR) * np.exp(-t * 10)
    paper = filt(noise(1.0), 'highpass', 2500) * np.exp(-t * 6) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 9 * t)))
    return norm(x + paper * 0.35)
def creak(s=0.7):
    t = T(s); f = 180 + 60 * np.sin(2 * np.pi * 1.3 * t)
    x = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 40 * t)))
    return fade(norm(filt(x, 'bandpass', [400, 2500])), 0.05, 0.2)
def rustle(s=0.35):
    t = T(s); return norm(filt(noise(s), 'bandpass', [800, 5000]) * np.sin(np.pi * t / s) ** 2)
def drip():
    t = T(0.25); f = 1400 * np.exp(-t * 18) + 700
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 30)
def riser(s=1.9):
    t = T(s); f = np.geomspace(120, 900, len(t))
    x = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * 0.4 + whoosh(s, 200, 6000)
    return norm(filt(x, 'lowpass', 5000) * (t / s) ** 2)
def stinger(s=3.0):
    t = T(s); fs = (73.4, 77.8, 110, 146.8, 155.6, 207.7, 311.1, 587.3, 622.3)
    x = sum(saw(f * (1 + 0.003 * k), t) for k, f in enumerate(fs))
    x = np.tanh(filt(x, 'lowpass', 3500) * 1.8) * np.exp(-t * 1.1)
    return norm(x + 0.6 * filt(noise(s), 'highpass', 3000) * np.exp(-t * 4))
def scream(s=0.6):
    t = T(s); f = np.geomspace(1800, 300, len(t)) * (1 + 0.04 * np.sin(2 * np.pi * 18 * t))
    x = np.tanh(3 * (signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) + 0.6 * filt(noise(s), 'bandpass', [800, 4000])))
    return norm(x * np.minimum(1, t / 0.05))

# ---------------- score + ambience ----------------
# warm study pad before the blackout
place(amb, pad(2.5, [174.6, 220, 261.6, 329.6]) * np.linspace(1, 0.8, int(2.5 * SR)), 0.0, db(-24))
# rain (library), louder after the lights die
r = rain(56.0); env = np.ones(len(r)) * db(-30); env[int(2.35 * SR):] = db(-25)
place(amb, r * env, 0.0, 1.0, -0.25); place(amb, rain(56.0) * env, 0.0, 1.0, 0.25)
# thunder
place(mix, thunder(True), 2.35, db(-4), -0.2); rvb_send[int(2.35 * SR):int(2.35 * SR) + int(5 * SR)] += thunder(True)[: N - int(2.35 * SR)][: int(5 * SR)] * 0.2
for lt, d in [(21.7, 0.8), (33.2, 0.5), (44.6, 0.9)]: place(mix, thunder(False), lt + d, db(-16), -0.4)
# tension drone through the library
dr = drone(53.2, 55.0); e = np.ones(len(dr)); a = int(1.5 * SR); e[:a] = np.linspace(0, 1, a); e[-int(0.4 * SR):] = np.linspace(1, 0, int(0.4 * SR))
place(amb, dr * e, 2.6, db(-17))
hi = tension_high(53.0); place(amb, hi * e[: len(hi)], 2.8, db(-33))
# basement drone, lower and colder
bd = drone(13.3, 36.7); e2 = np.ones(len(bd)); e2[: int(1 * SR)] = np.linspace(0, 1, int(1 * SR)); e2[-int(0.2 * SR):] = 0
place(amb, bd * e2, 57.6, db(-15))
# heartbeat: slow under the name call, faster in the crawl, racing at the reveal
for t0, t1, bpm, g in [(18.2, 25.0, 70, -14), (28.5, 37.2, 76, -16), (43.4, 55.5, 96, -13), (60.4, 65.2, 84, -12), (65.2, 69.9, 118, -9)]:
    t = t0
    while t < t1: place(mix, heartbeat(), t, db(g)); t += 60 / bpm
# hits & braams
place(mix, hit(), 4.25, db(-6)); place(mix, whoosh(0.7, 2000, 200), 4.95, db(-12))
place(mix, door_bang(), 6.55, db(-4), -0.1); place(mix, braam(), 6.6, db(-9))
for rt in (10.2, 25.0, 37.4, 49.4):
    place(mix, buzz(), rt + 0.15, db(-12)); place(mix, ding(), rt + 0.3, db(-12)); place(mix, braam(2.0, 36.7), rt + 0.05, db(-14))
place(mix, braam(2.6, 32.7), 18.45, db(-11))   # "Maya Torres."
place(mix, hit(1.8), 20.55, db(-14))
# footsteps (intruders), keys
def steps(t0, t1, every, g, pan):
    t = t0
    while t < t1: place(mix, step(), t + rng.uniform(-0.02, 0.02), db(g), pan); t += every
steps(6.75, 10.2, 0.42, -15, -0.1); steps(6.95, 10.2, 0.46, -19, -0.3); steps(7.2, 10.2, 0.44, -20, 0.3)
steps(13.1, 15.2, 0.5, -10, -0.5); place(mix, jingle(1.6), 13.4, db(-12), -0.5)
steps(15.2, 17.9, 0.55, -16, -0.4); place(mix, jingle(1.0), 16.6, db(-22), -0.4)
steps(28.4, 31.3, 0.62, -13, -0.5); place(mix, jingle(0.8), 28.6, db(-20), -0.5)
steps(31.4, 37.3, 0.9, -24, -0.7)
# crawl rustles
t = 43.5
while t < 49.3: place(mix, rustle(), t, db(-20), rng.uniform(-0.3, 0.3)); t += 0.36
place(mix, whoosh(1.2, 400, 1500), 46.3, db(-20), 0.4)   # beam sweeping overhead
# chute
place(mix, creak(), 52.85, db(-14), 0.3)
place(mix, whoosh(0.6, 300, 4000), 55.1, db(-10))
place(mix, slide(), 55.75, db(-7))
place(mix, book_thud(), 57.6, db(-3)); place(mix, hit(1.5), 57.6, db(-9))
# basement drips
for dt in (58.3, 59.4, 60.9, 62.2, 63.6, 64.7): place(mix, drip(), dt, db(-22), rng.uniform(-0.6, 0.6))
# phone buzz in the dark + rule 5
place(mix, buzz(3, 0.42, 0.3), 60.6, db(-9))
place(mix, ding(), 62.05, db(-14)); place(mix, braam(2.8, 30.9), 61.95, db(-8))
# the reveal
place(mix, riser(1.85), 65.2, db(-10))
place(mix, stinger(3.2), 67.0, db(-5)); rvb_send[int(67.0 * SR):int(67.0 * SR) + int(3.2 * SR)] += stinger(3.2) * 0.3
place(mix, scream(0.55), 69.4, db(-6)); place(mix, hit(1.6), 69.9, db(-2)); place(mix, braam(1.6, 27.5), 69.9, db(-6))

# ---------------- voices ----------------
lines = json.load(open(os.path.join(root, 'lines.json')))
vox = np.zeros((N, 2)); duck = np.zeros(N)
PAN = {'DEV': 0.05, 'MAYA': 0.0, 'JORDAN': 0.25, 'MAN': -0.25, 'THING': 0.0}
GAIN = {'DEV': -2, 'MAYA': -2.5, 'JORDAN': -2, 'MAN': -1.5, 'THING': 0}
for L in lines:
    y, sr = sf.read(os.path.join(root, 'audio/vo', L['id'] + '.wav'))
    if sr != SR: y = signal.resample_poly(y, SR, sr)
    y = norm(y) * db(GAIN[L['who']])
    place(vox, y, L['start'], 1.0, PAN[L['who']])
    i = int(L['start'] * SR); duck[i:i + len(y)] = 1
    if L['who'] in ('MAN', 'THING'): rvb_send[i:i + len(y)] += y * 0.35
# smooth duck envelope (attack 40ms, release 300ms)
sm = filt(duck, 'lowpass', 3, 2); sm = np.clip(sm, 0, 1)
amb *= (1 - 0.55 * sm)[:, None]

# ---------------- reverb (noise-IR convolution) ----------------
ir_t = T(2.8); ir = noise(2.8) * np.exp(-ir_t * 2.2); ir = filt(ir, 'lowpass', 4000); ir /= np.sqrt(np.sum(ir ** 2))
wet = signal.fftconvolve(rvb_send, ir)[:N] * 0.5
wetR = signal.fftconvolve(rvb_send, np.roll(ir, 37))[:N] * 0.5

out = mix + amb + vox
out[:, 0] += wet; out[:, 1] += wetR
# hard silence after the final hit tail, short fade in at the start
out[: int(0.05 * SR)] *= np.linspace(0, 1, int(0.05 * SR))[:, None]
out = np.tanh(out * 1.1) / np.tanh(1.1)
out /= np.max(np.abs(out)) / db(-1.0)
sf.write(os.path.join(root, 'audio/mix_raw.wav'), out.astype(np.float32), SR)
print('mix ok', out.shape, 'peak', np.max(np.abs(out)))
