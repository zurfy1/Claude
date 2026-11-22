// "The Roman and the cat" — 9:16 720x1280 30fps, 44.9 s. Egypt, sacred-cat law.
// S1 handcart + cat under the wheel | S2 street freezes, wailing, "never touch" stela | S3 Roman cries out, crowd sprints in
// S4 crowd at the door, officials shove through | S5 palace steps: ROME banner / EGYPT begging, banner falls
// S6 kneeling plea inside a ring of fists | S7 Diodorus writes, Eye of Horus | S8 ACCIDENT stamp crossed out | S9 sacred cat outweighs an empire
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, Easing, Audio, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Box, Cyl, Ball, CanvasPlane, Surface, INK } from "../style/toon";
import { Look } from "../style/puppet";
import { Person, Lights, Grade, seg, lerp, clamp, V3 } from "../style/kit";
import { Floor, WallDoor, Glow, Shaft, Dust, Lamp } from "../style/props";
import { Cam, Key, camAt, FaceGroup, hand, Extrude } from "../style/extra";
import { Pyramid, Obelisk, Palm, MudHouse, Jar, Crate, Torch, Banner, Hiero, Cat, HandCart, Scales, Prism, drawCat } from "../style/egypt";
import { Captions } from "../Main";

const FPS = 30, LEAD = 6, TAIL = 8, WALK = 3.4;
type Ctx = { t: number; f: number };
type Trans = "ghost" | "zoom" | "flash" | "whip";

const roman: Look = { skin: "#f7d4b5", body: "#c8302f", outfit: "shirt", hair: "short", hairColor: "#3b2412", hat: "#d4a017", shoe: "#5a3420" };
const official: Look = { skin: "#c98e62", body: "#1d6fd1", outfit: "blazer", shirt: "#ffffff", hair: "bob", hairColor: "#0f0f14", hat: "#ffc23a", badge: "#ffc23a", shoe: "#2a1a12" };
const official2: Look = { skin: "#a86b45", body: "#12858f", outfit: "blazer", shirt: "#f4ecd8", hair: "bob", hairColor: "#0f0f14", hat: "#ffc23a", badge: "#ff5a3a", shoe: "#2a1a12" };
const scribe: Look = { skin: "#d9a273", body: "#f2e8cf", outfit: "shirt", hair: "grey", hairColor: "#bfb8a8", shoe: "#6a4a2a", badge: "#c9a227" };
const crowd: Look[] = [
  { skin: "#c98e62", body: "#f4ecd8", outfit: "shirt", hair: "bob", hairColor: "#0f0f14" }, { skin: "#a86b45", body: "#e8a33a", outfit: "hoodie", hair: "short", hairColor: "#111" },
  { skin: "#d9a273", body: "#2fb5a8", outfit: "shirt", hair: "bob", hairColor: "#1a1010" }, { skin: "#8d5a3a", body: "#f4ecd8", outfit: "shirt", hair: "short", hairColor: "#111" },
  { skin: "#c98e62", body: "#d9503a", outfit: "hoodie", hair: "bob", hairColor: "#0f0f14" }, { skin: "#e0b48c", body: "#f4ecd8", outfit: "shirt", hair: "short", hairColor: "#2a1a10" },
  { skin: "#a86b45", body: "#3a7be0", outfit: "shirt", hair: "bob", hairColor: "#111" }, { skin: "#d9a273", body: "#f0c24a", outfit: "hoodie", hair: "short", hairColor: "#222" },
];

/* ---------- scene wrapper (4 transitions) ---------- */
const Scene: React.FC<{ start: number; end: number; first?: boolean; trans?: Trans; bg: string; children: (c: Ctx) => React.ReactNode }> = ({ start, end, first, trans = "ghost", bg, children }) => {
  const from = Math.round(start * FPS) - (first ? 0 : LEAD), dur = Math.round(end * FPS) - from + TAIL;
  return <Sequence from={from} durationInFrames={dur} layout="none"><Inner from={from} first={first} trans={trans} bg={bg} children={children} /></Sequence>;
};
const Inner: React.FC<{ from: number; first?: boolean; trans: Trans; bg: string; children: (c: Ctx) => React.ReactNode }> = ({ from, first, trans, bg, children }) => {
  const f = useCurrentFrame(), t = (f + from) / FPS;
  const k = first ? 1 : clamp(f / (LEAD + 2)), ke = Easing.out(Easing.cubic)(k);
  const sc = !first && trans === "zoom" ? lerp(1.35, 1, ke) : 1;
  const tx = !first && trans === "whip" ? (1 - ke) * 720 : 0, blur = !first && trans === "whip" ? (1 - ke) * 14 : 0;
  return (
    <AbsoluteFill style={{ opacity: first || trans === "flash" || trans === "whip" ? 1 : k, transform: `translateX(${tx}px) scale(${sc})`, background: bg, filter: `saturate(1.32) contrast(1.07) brightness(1.02)${blur > 0.2 ? ` blur(${blur.toFixed(1)}px)` : ""}` }}>
      <ThreeCanvas width={720} height={1280} camera={{ fov: 60, position: [0, 2, 8], near: 0.1, far: 200 }} gl={{ antialias: true }}>
        <color attach="background" args={[bg]} />{children({ t, f })}
      </ThreeCanvas>
      {!first && trans === "flash" ? <AbsoluteFill style={{ background: "#fff", opacity: 1 - clamp(f / 7) }} /> : null}
    </AbsoluteFill>
  );
};
const yawTo = (cam: V3, p: V3) => Math.atan2(cam[0] - p[0], cam[2] - p[2]);
const toWorld = (p: V3, loc: V3, cam: V3): V3 => { const y = yawTo(cam, p); return [p[0] + loc[0] * Math.cos(y) + loc[2] * Math.sin(y), p[1] + loc[1], p[2] - loc[0] * Math.sin(y) + loc[2] * Math.cos(y)]; };
const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const sand = (c = "#e2b866", d = "#d9ad5a", u = 2.4) => <Floor kind="tile" a={c} b={d} unit={u} w={60} d={60} />;

// houses + palms + jars along the back of the street (seeded so every scene is dressed differently)
const Town: React.FC<{ t: number; seed: number; z?: number; x0?: number; x1?: number; pyr?: boolean; tone?: string[] }> = ({ t, seed, z = -6, x0 = -16, x1 = 16, pyr = true, tone = ["#d99a5b", "#e4b06a", "#c9854a", "#f0c27a"] }) => {
  const hs: React.ReactNode[] = []; let x = x0;
  for (let i = 0; x < x1; i++) { const w = 2.8 + rnd(seed + i) * 2.4, h = 3 + rnd(seed + i * 3) * 3.2; hs.push(<MudHouse key={i} p={[x + w / 2, 0, z - rnd(seed + i * 7) * 1.4]} w={w} h={h} color={tone[i % tone.length]} awning={i % 3 === 0 ? ["#e5483a", "#2fb5a8", "#ffc23a"][i % 3 + (i % 2)] ?? "#e5483a" : undefined} door={i % 2 === 0} />); x += w + 0.35; }
  return (<>
    {pyr ? <><Pyramid p={[-9, 0, z - 32]} base={26} h={17} /><Pyramid p={[8, 0, z - 40]} base={34} h={22} color="#f0c878" rotY={0.1} /><Pyramid p={[24, 0, z - 30]} base={14} h={9} /></> : null}
    {hs}
    <Palm p={[x0 + 3.2, 0, z + 1.4]} s={1.15} lean={0.12} t={t} /><Palm p={[x1 - 4, 0, z + 1.2]} s={1.0} lean={-0.14} t={t} /><Palm p={[(x0 + x1) / 2 + 2, 0, z - 3]} s={1.3} lean={0.1} t={t} />
    <Jar p={[x0 + 6, 0, z + 2.4]} /><Jar p={[x0 + 6.8, 0, z + 2.6]} s={0.85} color="#2f8f9a" /><Crate p={[x1 - 7, 0, z + 2.2]} rotY={0.4} /><Crate p={[x1 - 6.2, 0, z + 2.5]} s={0.75} />
    <Obelisk p={[(x0 + x1) / 2 - 5.5, 0, z - 6]} h={7} />
  </>);
};
const Sun: React.FC<{ p: V3; r?: number; c?: string }> = ({ p, r = 3, c = "255,236,160" }) => <><Glow p={p} r={r * 2.4} color={`rgba(${c},1)`} o={0.55} /><Ball p={p} r={r * 0.5} color="#fff3b0" ink={0.1} /></>;
const Tear: React.FC<{ p: V3; t: number; k?: number }> = ({ p, t, k = 0 }) => { const ph = (t * 1.6 + k) % 1; return <Ball p={[p[0], p[1] - ph * 0.9, p[2]]} r={0.07} color="#7fd0ff" s={[1, 1.4, 1]} ink={0.02} />; };

/* =================== S1 0 – 5.75  handcart, cat under the wheel, the bump, he looks back =================== */
const K1: Key[] = [
  { t: 0, pos: [-1.0, 2.6, 10.5], look: [0.8, 0.8, 0], fov: 56 }, { t: 1.2, pos: [1.2, 2.3, 8.8], look: [1.5, 0.7, 0], fov: 52 },
  { t: 2.6, pos: [2.6, 2.0, 8.6], look: [2.6, 0.6, 0], fov: 50 }, { t: 3.2, pos: [2.8, 2.2, 9.0], look: [2.6, 0.7, 0], fov: 52 },
  { t: 4.2, pos: [2.2, 2.2, 9.0], look: [2.1, 0.8, 0], fov: 54 }, { t: 5.9, pos: [1.8, 1.7, 7.8], look: [1.5, 0.5, 0], fov: 52 },
];
const V1 = 0.62, XW0 = -0.24, TB = 2.8, R = 0.56;
const dist1 = (t: number) => (t < TB ? V1 * t : V1 * TB + 0.1 * (1 - Math.exp(-(t - TB) * 5)));
const S1 = ({ t, f }: Ctx) => {
  const xw = XW0 + dist1(t), pull = t < 3.05, rx = xw + 1.9, h = 3.3;
  const sp = pull ? 0.5 * seg(t, 0, 0.3, Easing.linear) * (1 - seg(t, 2.9, 3.1, Easing.linear)) : 0;
  const since = t - TB, jolt = since > 0 ? Math.exp(-since * 9) : 0;
  const bump = since > 0 ? 0.2 * jolt * Math.abs(Math.sin(since * 26)) : 0;
  const flipped = t > 3.35, turn = seg(t, 3.35, 3.6);
  const catRun = t < 1.2, cx = t < 0.3 ? 7.8 : t < 1.2 ? lerp(7.8, 1.65, Easing.out(Easing.quad)(clamp((t - 0.3) / 0.9))) : 1.62 + 0.04 * Math.sin(t * 40) * (t < TB ? 0.5 : 0);
  const cam = camAt(t, K1).pos, P: V3 = [rx, 0, 0.15];
  const handW = toWorld(P, hand(h, [-0.12, 0.43], 0, false, -0.05), cam), cartAt: V3 = [xw - 0.3, 0.92 + bump, 0.0];
  const dx = handW[0] - cartAt[0], dy = handW[1] - cartAt[1], len = Math.hypot(dx, dy), ang = Math.atan2(dy, dx);
  const flung = since > 0 ? Math.min(1, since / 0.3) : 0, lieX = xw - 0.9 - 0.15 * (1 - Math.exp(-since * 6));
  return (<>
    <Cam t={t} keys={K1} impacts={[[TB, 0.05]]} />
    <Lights warm="#fff0c8" />{sand()}
    <Sun p={[10, 11, -40]} r={4} /><Town t={t} seed={4} z={-5.5} />
    {/* stall across the road + hanging laundry + torches: depth layers */}
    <Box p={[6.5, 1.0, -2.6]} s={[3.4, 0.12, 1.4]} color="#8a5a32" /><Box p={[6.5, 0.5, -2.6]} s={[3.2, 1.0, 1.2]} color="#a8733a" /><Box p={[6.5, 3.0, -2.6]} s={[3.8, 0.12, 1.8]} color="#e5483a" rot={[0.15, 0, 0]} />
    <Jar p={[5.6, 1.05, -2.6]} s={0.8} /><Jar p={[6.4, 1.05, -2.5]} s={0.7} color="#2f8f9a" /><Jar p={[7.3, 1.05, -2.7]} s={0.75} color="#ffc23a" />
    <Banner p={[-5.5, 3.6, -3.4]} s={[1.6, 2.2]} color="#2fb5a8" sway={Math.sin(t * 1.3) * 0.08} /><Banner p={[-3.0, 3.8, -3.2]} s={[1.2, 1.8]} color="#e5483a" sway={Math.sin(t * 1.1 + 1) * 0.08} />
    <Torch p={[-7, 0, -1.5]} t={t} /><Torch p={[9.5, 0, -0.5]} t={t} /><Crate p={[3.3, 0, -1.4]} s={1.1} rotY={0.3} /><Jar p={[-4.8, 0, -1.2]} s={1.2} />
    <Shaft p={[2, 5, -2]} s={[2.4, 9]} rot={[0, 0, 0.5]} color="255,236,150" o={0.12} /><Dust t={t} area={[9, 3, 3]} />
    {/* the cart, handle, Roman */}
    <HandCart p={[xw, 0, 0]} spin={dist1(t) / R} bump={bump} tilt={since > 0 ? -0.05 * jolt : 0} />
    {pull ? <Box p={[(cartAt[0] + handW[0]) / 2, (cartAt[1] + handW[1]) / 2, 0.02]} s={[len, 0.08, 0.1]} rot={[0, 0, ang]} color="#7a4a22" line={2} /> : null}
    <Person p={P} h={h} look={roman} f={f} pose={{ walk: (xw - XW0) * WALK, speed: sp, flip: flipped, lookX: flipped ? -1 : 0.3, mood: t < 2.8 ? "smile" : t < 4.2 ? "shock" : "worry", squash: since > 0 ? -0.1 * jolt : 0,
      armL: pull ? [-0.12, 0.43] : undefined, armLK: pull ? 1 : 0, arms: t > 4.5 ? "head" : undefined, armK: t > 4.5 ? seg(t, 4.5, 4.8) : 1, sweat: t > 3.4 ? 1 : 0, nerv: t > 3.4 ? 0.3 : 0, tilt: t > 3.4 ? -0.05 : 0 }} />
    {/* the cat: runs in (faces left), crouches in front of the wheel, rolled over on "bump", then lies still behind it */}
    {t < TB ? <Cat p={[cx, 0, -0.12]} h={3.0} pose={catRun ? "run" : "scared"} t={t} flip /> : <Cat p={[lieX, 0, 0.05]} h={3.0} pose="lie" t={t} flip />}
    {since > 0 && since < 0.5 ? <Glow p={[xw, 0.5, 0.4]} r={1.6} color="rgba(255,235,190,1)" o={0.7 * Math.exp(-since * 7)} /> : null}
  </>);
};

/* =================== S2 5.75 – 13.5  people freeze, stand far off, wail; "never touch a dead cat" stela =================== */
const K2: Key[] = [
  { t: 5.7, pos: [2.2, 1.5, 6.6], look: [0.0, 0.5, 0], fov: 56 }, { t: 6.9, pos: [0.6, 2.4, 7.4], look: [0.0, 1.2, -12], fov: 56 },
  { t: 8.6, pos: [0.2, 2.5, 5.6], look: [0.2, 1.8, -14], fov: 54 }, { t: 10.4, pos: [-0.4, 3.0, 3.8], look: [0.3, 2.2, -14], fov: 56 },
  { t: 11.7, pos: [0.6, 3.2, 4.8], look: [2.4, 2.8, -4], fov: 52 }, { t: 13.7, pos: [0.8, 3.2, 5.6], look: [2.8, 2.8, -5], fov: 50 },
];
const FZ = 6.92;
const S2 = ({ t, f }: Ctx) => {
  const wail = seg(t, 10.46, 10.9), stela = seg(t, 11.46, 11.86, Easing.out(Easing.back(2.4)));
  const people = Array.from({ length: 11 }, (_, i) => ({ x: -6.5 + i * 1.35 + rnd(i) * 0.7, zs: -9.5 - (i % 3) * 2.0 - rnd(i + 2) * 1.2, z0: 0 }));
  return (<>
    <Cam t={t} keys={K2} />
    <Lights warm="#ffd2a0" />{sand("#e8b25e", "#dca64f")}
    <Sun p={[-8, 8, -44]} r={5} c="255,170,80" /><Town t={t} seed={11} z={-26} x0={-20} x1={20} tone={["#d38a4b", "#e0a35a", "#c27a3e", "#e9b96c"]} />
    {[-4.2, 4.2].map((x) => <React.Fragment key={x}><Palm p={[x * 1.6, 0, -9]} s={1.3} lean={x > 0 ? -0.12 : 0.12} t={t} /><Torch p={[x, 0, -4]} t={t} /></React.Fragment>)}
    <Crate p={[-3, 0, -3]} rotY={0.5} /><Jar p={[-2.4, 0, -3.4]} s={1.1} /><Jar p={[4.6, 0, -2]} s={1.0} color="#2f8f9a" /><Dust t={t} area={[8, 3, 8]} color="rgba(255,225,170,.8)" />
    <Shaft p={[1, 5, -4]} s={[2.8, 10]} rot={[0, 0, -0.45]} color="255,200,120" o={0.14} />
    {/* the cat, lying still in the road */}
    <Cat p={[0, 0, 0.4]} h={3.0} pose="lie" t={t} />
    {/* crowd: walks in, freezes mid-step on "freeze", holds far off, then wails */}
    {people.map((p, i) => { const walkEnd = FZ - (i % 4) * 0.03, d = Math.min(Math.max(0, t - 5.75), walkEnd - 5.75), z = Math.min(p.zs - 3.6 + d * 3.0, p.zs), moving = t < walkEnd && z < p.zs - 0.05;
      const frz = seg(t, FZ - 0.02, FZ + 0.12, Easing.out(Easing.back(3))), h = 2.9 - (i % 3) * 0.2, wl = wail * (0.6 + 0.4 * Math.sin(f * 0.5 + i * 1.7));
      return <React.Fragment key={i}><Person p={[p.x, 0, z]} h={h} look={crowd[i % 8]} f={f + i * 7} pose={{ walk: d * 3.0 * WALK, speed: moving ? 0.7 : 0, mood: t < FZ ? "deadpan" : t < 10.46 ? "shock" : "laugh", squash: frz * 0.08 * (t < FZ + 0.4 ? 1 : 0), air: 0,
        arms: t < FZ ? "down" : t < 10.46 ? (i % 2 ? "chest" : "head") : "up", armK: t < 10.46 ? 1 : 0.55 + 0.45 * wl, nerv: t > 10.46 ? 0.2 : 0, sweat: t > FZ && i % 3 === 0 ? 0.7 : 0, hunch: t > FZ ? 0.4 : 0, lookX: 0 }} />
        {t > 10.7 && i % 2 === 0 ? <><Tear p={[p.x + 0.35, h * 0.72, z + 0.1]} t={t} k={i * 0.3} /><Tear p={[p.x - 0.35, h * 0.72, z + 0.1]} t={t} k={i * 0.3 + 0.5} /></> : null}</React.Fragment>; })}
    {/* the law: stone stela, golden cat + red ban ring over a reaching hand */}
    <group position={[3.2, 0, -5]} rotation={[0, -0.3, 0]} scale={[stela * 0.72, stela * 0.72, stela * 0.72]}>
      <Box p={[0, 3.0, 0]} s={[2.6, 6.0, 0.5]} color="#d9a85a" /><Cyl p={[0, 6.05, 0]} rt={1.3} h={0.5} color="#d9a85a" rot={[Math.PI / 2, 0, 0]} />
      <CanvasPlane p={[0, 3.6, 0.27]} s={[2.2, 4.2]} px={[220, 420]} draw={(c, W, H) => {
        c.fillStyle = "#f1cf86"; c.fillRect(0, 0, W, H); c.save(); c.translate(W * 0.5 - 256 * 0.62, H * 0.6 - 755 * 0.62); c.scale(0.62, 0.62); drawCat(c, 512, 768, "statue", t, false); c.restore();
        c.strokeStyle = "#7a3b12"; c.lineWidth = 6; c.beginPath(); c.moveTo(20, H * 0.62); c.lineTo(W - 20, H * 0.62); c.stroke();
        c.fillStyle = "#3b2412"; c.beginPath(); c.arc(W * 0.5, H * 0.8, 40, 0, 7); c.fill(); c.fillRect(W * 0.5 - 14, H * 0.8 - 6, 28, 50); for (let k = -2; k <= 1; k++) c.fillRect(W * 0.5 + k * 16 - 6, H * 0.8 - 56, 12, 40);
        c.strokeStyle = "#e5233a"; c.lineWidth = 14; c.beginPath(); c.arc(W * 0.5, H * 0.8, 72, 0, 7); c.moveTo(W * 0.5 - 50, H * 0.8 + 50); c.lineTo(W * 0.5 + 50, H * 0.8 - 50); c.stroke();
      }} frame="#0b0d1a" />
    </group>
    <Glow p={[3.2, 3, -4.7]} r={4.0} color="rgba(255,210,90,1)" o={0.35 * stela} />
  </>);
};

/* =================== S3 13.5 – 17.0  Roman cries out; the crowd sprints in ("too late") =================== */
const K3: Key[] = [
  { t: 13.4, pos: [0.6, 1.8, 9.0], look: [0.6, 1.3, 0], fov: 54 }, { t: 14.6, pos: [0.8, 2.0, 8.2], look: [0.8, 1.5, 0], fov: 52 },
  { t: 15.9, pos: [0.4, 1.8, 8.6], look: [0.6, 1.3, -2], fov: 54 }, { t: 17.2, pos: [0.4, 1.4, 11.5], look: [0.4, 1.8, -8], fov: 62 },
];
const S3 = ({ t, f }: Ctx) => {
  const shout = seg(t, 13.68, 13.9), point = seg(t, 14.64, 14.9) * (1 - seg(t, 15.7, 15.95)), late = seg(t, 15.94, 16.3);
  const runners = Array.from({ length: 9 }, (_, i) => ({ x: -6 + i * 1.5 + rnd(i + 20) * 0.7, z0: -11.5 - rnd(i + 9) * 2 }));
  return (<>
    <Cam t={t} keys={K3} />
    <Lights warm="#ffb98a" />{sand("#e8a85a", "#d99a4a")}
    <Sun p={[0, 7, -46]} r={5} c="255,150,90" /><Town t={t} seed={23} z={-12} x0={-22} x1={22} tone={["#c97a4a", "#d98c52", "#b86a3e", "#e0a060"]} />
    <MudHouse p={[-5.2, 0, -3.2]} w={3.4} h={4.2} color="#d38a4b" awning="#2fb5a8" /><Palm p={[5.6, 0, -4]} s={1.4} lean={-0.15} t={t} /><Jar p={[-2.4, 0, -1.2]} s={1.2} /><Crate p={[3.2, 0, -1.6]} s={1.2} rotY={-0.3} />
    <Torch p={[4.4, 0, -0.6]} t={t} /><Dust t={t} area={[9, 3, 9]} color="rgba(255,205,150,.85)" />
    <Cat p={[1.5, 0, 0.9]} h={3.0} pose="lie" t={t} />
    <Person p={[-0.5, 0, 0.2]} h={3.2} look={roman} f={f} pose={{ mood: t < 15.9 ? "shock" : "worry", arms: t < 14.5 ? "up" : undefined, armK: 0.7 + 0.3 * Math.sin(f * 0.6), armR: t >= 14.5 ? [0.34, 0.12 + 0.4 * (1 - point)] : undefined, armRK: point,
      armL: t >= 14.5 ? [-0.3, 0.55 + 0.1 * Math.sin(f * 0.5)] : undefined, armLK: seg(t, 14.5, 14.8), lookX: t < 14.5 ? 0 : 1, flip: false, hunch: shout * 0.4, squash: -0.08 * shout * (t < 14.1 ? 1 : 0) + late * -0.12, sweat: 1, nerv: t > 15.9 ? 0.4 : 0, tilt: Math.sin(t * 9) * 0.04 * (1 - seg(t, 15.0, 15.2)) }} />
    {runners.map((r, i) => { const run = clamp((t - 15.4) / 1.6), z = lerp(r.z0, -2.5 - (i % 3) * 1.3, run * 0.7 + run * run * 0.3), d = (z - r.z0), moving = t > 15.4 && t < 17.2;
      return <Person key={i} p={[r.x + (i < 4 ? 0.2 : -0.2) * (z - r.z0) * 0.12, 0, z]} h={2.8} look={crowd[i % 8]} f={f + i * 5} pose={{ walk: d * 3.2, speed: moving ? 1 : 0, mood: "angry", arms: "up", armK: 0.6 + 0.4 * Math.sin(f * 0.7 + i), lookX: 0 }} />; })}
    {t > 15.9 ? <Glow p={[0, 2.4, -12]} r={8} color="rgba(255,200,120,1)" o={0.3 * late} /> : null}
  </>);
};

/* =================== S4 17.0 – 22.3  crowd at the door; officials shove through, begging for calm =================== */
const K4: Key[] = [
  { t: 16.9, pos: [-3.4, 3.8, 14.5], look: [0.4, 1.00, 0], fov: 58 }, { t: 18.5, pos: [-1.4, 3.6, 12.5], look: [0.4, 0.90, 0], fov: 56 },
  { t: 20.4, pos: [0.4, 3.4, 11.5], look: [0.4, 1.00, 1], fov: 54 }, { t: 22.4, pos: [0.4, 3.0, 10.0], look: [0.4, 1.00, 1.5], fov: 50 },
];
const S4 = ({ t, f }: Ctx) => {
  const cr = Array.from({ length: 10 }, (_, i) => ({ x: -1.8 + (i % 5) * 1.1 + (i > 4 ? 0.5 : 0) + rnd(i + 31) * 0.4, zf: 2.2 + Math.floor(i / 5) * 1.4, from: 9 + rnd(i + 3) * 5 }));
  const offAt = (k: number) => { const u = seg(t, 19.0 + k * 0.18, 20.9 + k * 0.1, Easing.inOut(Easing.sin)); return { x: lerp(-5.4, 1.1 + k * 1.6, u), z: lerp(6.5, 3.6 + k * 0.1, u), u }; };
  const calm = seg(t, 21.1, 21.5);
  return (<>
    <Cam t={t} keys={K4} />
    <Lights warm="#ffa870" />{sand("#d99a58", "#cc8c48", 2.6)}
    <Sun p={[-12, 6, -30]} r={4} c="255,120,70" />
    {/* his house: real doorway in the wall */}
    <WallDoor z={-1.4} W={28} kind="plain" a="#d38a4b" b="#c47c40" door={{ x: 0.4, w: 2.2, h: 4.2 }} base="#8a5a2c" />
    <Box p={[0.4, 2.2, -2.6]} s={[2.4, 4.4, 2.4]} color="#3a2316" line={1} /><Glow p={[0.4, 1.8, -1.7]} r={2.2} color="rgba(255,180,90,1)" o={0.5} />
    <Box p={[0.4, 4.9, -1.3]} s={[3.4, 0.3, 0.5]} color="#c28445" /><Box p={[-3.6, 3.0, -1.3]} s={[1.0, 0.8, 0.1]} color="#2a1810" line={2} /><Box p={[4.6, 3.0, -1.3]} s={[1.0, 0.8, 0.1]} color="#2a1810" line={2} />
    <Pyramid p={[10, 0, -34]} base={30} h={19} /><Palm p={[-6.5, 0, -0.6]} s={1.3} lean={0.12} t={t} /><Palm p={[8, 0, -0.6]} s={1.2} lean={-0.12} t={t} />
    <Jar p={[-2.1, 0, -0.5]} s={1.2} /><Jar p={[-2.8, 0, -0.4]} s={0.9} color="#2f8f9a" /><Crate p={[3.2, 0, -0.5]} s={1.1} /><Torch p={[-4.4, 0, -0.4]} t={t} /><Torch p={[5.6, 0, -0.4]} t={t} />
    <Banner p={[7.4, 5.2, -1.2]} s={[1.4, 2.0]} color="#e5483a" sway={Math.sin(t * 1.2) * 0.06} /><Dust t={t} area={[8, 3, 6]} color="rgba(255,200,140,.85)" />
    {/* Roman on his doorstep, terrified */}
    <Person p={[0.4, 0, -0.5]} h={3.2} look={roman} f={f} pose={{ mood: t < 19 ? "worry" : "shock", arms: t < 18 ? "chest" : "head", armK: 1, hunch: 0.5, sweat: 1, nerv: 0.7, lookX: 0.2, squash: -0.04 }} />
    {/* crowd arrives from the right, packs in front of the door */}
    {cr.map((c, i) => { const u = seg(t, 17.2 + (i % 4) * 0.12, 18.5 + (i % 3) * 0.12, Easing.out(Easing.cubic)), x = lerp(c.x + c.from, c.x, u), moving = u > 0 && u < 0.98;
      const nearOff = [0, 1, 2].reduce((m, k) => { const o = offAt(k); return Math.max(m, o.u > 0 && o.u < 1 ? Math.max(0, 1 - Math.hypot(o.x - c.x, o.z - c.zf) / 1.6) : 0); }, 0);
      return <Person key={i} p={[x + nearOff * (c.x > 0.6 ? 0.6 : -0.6), 0, c.zf]} h={2.7 - (i % 3) * 0.12} look={crowd[i % 8]} f={f + i * 4} pose={{ walk: (c.from - (x - c.x)) * WALK, speed: moving ? 0.9 : 0, flip: true, mood: "angry", arms: "up", armK: 0.55 + 0.4 * Math.sin(f * 0.6 + i), tilt: nearOff * (c.x > 0.6 ? 0.22 : -0.22), lookX: -1 }} />; })}
    {[0, 1].map((k) => { const o = offAt(k), moving = o.u > 0 && o.u < 0.96; return <React.Fragment key={k}>
      <Person p={[o.x, 0, o.z]} h={3.0} look={k ? official2 : official} f={f + k * 11} pose={{ walk: (o.x + 5.4) * WALK * 0.8, speed: moving ? 0.9 : 0, mood: calm > 0 ? "worry" : "angry", sweat: 1, nerv: 0.3,
        armR: o.u > 0 ? [0.42, 0.52 + (calm > 0 ? 0.04 * Math.sin(f * 0.8 + k) : 0.1 * Math.sin(f * 0.5))] : undefined, armRK: seg(t, 18.9, 19.2), armL: o.u > 0 ? [-0.42, 0.52 + (calm > 0 ? 0.04 * Math.sin(f * 0.8 + 2) : 0.1 * Math.sin(f * 0.5 + 1))] : undefined, armLK: seg(t, 18.9, 19.2), lookX: 0, flip: false }} /></React.Fragment>; })}
  </>);
};

/* =================== S5 22.3 – 29.7  palace steps: ROME banner, EGYPT begging, banner falls on "None of it matters" =================== */
const K5: Key[] = [
  { t: 22.2, pos: [-4.0, 2.6, 13.5], look: [-0.6, 1.30, -1.5], fov: 58 }, { t: 24.2, pos: [-1.5, 2.8, 12.5], look: [-0.2, 1.40, -1.5], fov: 54 },
  { t: 25.4, pos: [2.0, 3.0, 12.5], look: [1.0, 1.20, -1.5], fov: 54 }, { t: 28.0, pos: [2.4, 2.8, 11.0], look: [0.6, 0.90, -1], fov: 50 }, { t: 29.8, pos: [1.4, 2.4, 10.0], look: [0.4, 0.50, -1], fov: 52 },
];
const eagle = (c: CanvasRenderingContext2D, W: number, H: number) => {
  c.fillStyle = "#c8302f"; c.fillRect(0, 0, W, H); c.fillStyle = "#ffd24a"; c.strokeStyle = INK; c.lineWidth = 6;
  c.beginPath(); c.moveTo(W / 2, H * 0.2); c.lineTo(W * 0.9, H * 0.38); c.lineTo(W * 0.62, H * 0.42); c.lineTo(W * 0.78, H * 0.62); c.lineTo(W * 0.54, H * 0.52); c.lineTo(W / 2, H * 0.72); c.lineTo(W * 0.46, H * 0.52); c.lineTo(W * 0.22, H * 0.62); c.lineTo(W * 0.38, H * 0.42); c.lineTo(W * 0.1, H * 0.38); c.closePath(); c.fill(); c.stroke();
  c.font = "900 54px Inter, Arial"; c.textAlign = "center"; c.fillStyle = "#ffd24a"; c.fillText("ROME", W / 2, H * 0.9);
};
const S5 = ({ t, f }: Ctx) => {
  const rise = seg(t, 22.7, 23.5, Easing.out(Easing.back(1.6))), egy = seg(t, 25.3, 25.9, Easing.out(Easing.back(1.8))), fall = seg(t, 28.78, 29.25, Easing.in(Easing.quad)), plead = seg(t, 26.0, 26.4);
  const romeY = lerp(-2, 6.2, rise) - fall * 5.2, sway = Math.sin(t * 1.4) * 0.05;
  return (<>
    <Cam t={t} keys={K5} impacts={[[29.2, 0.04]]} />
    <Lights warm="#e8fff8" />
    <Floor kind="marble" a="#2fb5a8" b="#27a095" unit={2.2} w={40} d={30} />
    <Surface p={[0, 4.5, -5.2]} s={[40, 9]} kind="plain" a="#1d8f99" b="#1d8f99" unit={2} />
    <Hiero p={[-9, 3.6, -5.1]} s={[7, 5.2]} bg="#e9c474" ink="#8a3b12" seed={5} /><Hiero p={[9.5, 3.6, -5.1]} s={[7, 5.2]} bg="#e9c474" ink="#8a3b12" seed={8} />
    {[-5.2, 5.2].map((x) => <React.Fragment key={x}><Cyl p={[x, 4.2, -3.2]} rt={0.55} h={8.4} color="#f2d691" /><Cyl p={[x, 8.6, -3.2]} rt={0.95} rb={0.55} h={0.8} color="#2fb5a8" /><Cyl p={[x, 0.2, -3.2]} rt={0.85} h={0.4} color="#c9a227" /></React.Fragment>)}
    {[0, 1, 2].map((i) => <Box key={i} p={[0, 0.2 + i * 0.4, -1.4 - i * 0.9]} s={[13 - i * 1.6, 0.4, 2.6]} color={i % 2 ? "#e9c474" : "#f2d691"} line={3} />)}
    <Torch p={[-6.8, 0, 0.8]} t={t} h={2.6} /><Torch p={[6.8, 0, 0.8]} t={t} h={2.6} /><Jar p={[-3.6, 1.2, -1.5]} s={0.9} color="#ffc23a" /><Jar p={[3.6, 1.2, -1.5]} s={0.9} color="#ffc23a" />
    <Palm p={[-8.4, 0, -2.4]} s={1.3} lean={0.1} t={t} /><Palm p={[8.6, 0, -2.4]} s={1.3} lean={-0.1} t={t} /><Dust t={t} area={[9, 4, 4]} color="rgba(255,240,190,.8)" />
    {/* ROME banner rises on the left pole; EGYPT banner + gold pile on the right */}
    <Cyl p={[-2.4, 4.4, -2.6]} rt={0.07} h={9} color="#7a5a2a" line={2} />
    <group position={[-1.2, romeY + (fall > 0 ? 0 : 0), -2.5]} rotation={[0, 0, fall * 1.1 * (1 - 0)]}><Banner p={[0, 0, 0]} s={[2.4, 3.2]} color="#c8302f" draw={eagle} sway={sway} /></group>
    <Cyl p={[3.0, 4.4, -2.6]} rt={0.07} h={9} color="#7a5a2a" line={2} />
    <group position={[2.8, lerp(-2, 6.0, egy), -2.5]}><Banner p={[0, 0, 0]} s={[2.4, 3.2]} color="#1d6fd1" draw={(c, W, H) => { c.fillStyle = "#ffd24a"; c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.arc(W / 2, H * 0.3, 26, 0, 7); c.moveTo(W / 2, H * 0.3 + 26); c.lineTo(W / 2, H * 0.62); c.moveTo(W / 2 - 40, H * 0.43); c.lineTo(W / 2 + 40, H * 0.43); c.lineWidth = 16; c.strokeStyle = "#ffd24a"; c.stroke(); c.fillStyle = "#ff3b5a"; c.beginPath(); c.moveTo(W / 2, H * 0.86); c.bezierCurveTo(W / 2 - 70, H * 0.72, W / 2 - 40, H * 0.66, W / 2, H * 0.74); c.bezierCurveTo(W / 2 + 40, H * 0.66, W / 2 + 70, H * 0.72, W / 2, H * 0.86); c.fill(); }} sway={-sway} /></group>
    {[0, 1, 2, 3].map((i) => <Box key={i} p={[4.6 + (i % 2) * 0.9, 0.45 + Math.floor(i / 2) * 0.9, 1.4 + (i % 2) * 0.3]} s={[0.8, 0.8, 0.8]} color="#ffc23a" line={3} rot={[0, 0.2 * i, 0]} />)}<Glow p={[5, 1.2, 1.6]} r={2.2} color="rgba(255,220,100,1)" o={0.4 * egy} />
    {/* two officials: shout (Rome) then beg (Egypt) */}
    <Person p={[-0.8, 0.4, -0.8]} sy={0.4} h={3.3} look={official} f={f} pose={{ mood: t < 25.3 ? "angry" : "worry", arms: t < 25.3 ? "up" : undefined, armK: 0.75 + 0.25 * Math.sin(f * 0.5), armR: t >= 25.3 ? [0.36, 0.38 + 0.12 * plead] : undefined, armRK: seg(t, 25.3, 25.6), armL: t >= 25.3 ? [-0.36, 0.38 + 0.12 * plead] : undefined, armLK: seg(t, 25.3, 25.6),
      hunch: t >= 25.3 ? 0.8 : 0, sweat: t >= 25.3 ? 1 : 0, nerv: t >= 28.78 ? 0.6 : 0, squash: t >= 25.3 ? -0.1 * plead : 0, lookX: 0.2 }} />
    <Person p={[1.9, 0.4, -0.9]} sy={0.4} h={3.1} look={official2} f={f + 9} pose={{ mood: t < 25.3 ? "angry" : "worry", arms: t < 25.3 ? "point" : "chest", armK: 1, hunch: t >= 25.3 ? 0.7 : 0, sweat: t >= 25.3 ? 1 : 0, lookX: -0.2, flip: true, nerv: t >= 28.78 ? 0.6 : 0 }} />
    {fall > 0.05 && fall < 1 ? <Glow p={[-1.2, 1.5, -2]} r={3} color="rgba(255,225,180,1)" o={0.5 * (1 - fall)} /> : null}
  </>);
};

/* =================== S6 29.7 – 32.65  kneeling plea inside a ring of fists =================== */
const K6: Key[] = [{ t: 29.6, pos: [-4.4, 1.0, 9.6], look: [0, 1.00, 0], fov: 58 }, { t: 31.2, pos: [0.4, 0.9, 8.6], look: [0, 1.00, 0], fov: 52 }, { t: 32.8, pos: [4.2, 1.1, 9.4], look: [0, 1.00, 0], fov: 56 }];
const S6 = ({ t, f }: Ctx) => {
  const cover = seg(t, 31.74, 31.98) * (1 - seg(t, 32.4, 32.6));
  return (<>
    <Cam t={t} keys={K6} />
    <Lights warm="#ff9a70" />{sand("#c47a3e", "#b96d34", 2.2)}
    <Sun p={[0, 4, -36]} r={5} c="255,90,60" /><Town t={t} seed={41} z={-9} x0={-20} x1={20} tone={["#a9552f", "#b8663a", "#964a2a", "#c47a3e"]} />
    <Torch p={[-4, 0, -2.5]} t={t} /><Torch p={[4.4, 0, -2.5]} t={t} /><Dust t={t} area={[8, 3, 8]} color="rgba(255,170,120,.8)" />
    {Array.from({ length: 9 }, (_, i) => { const a = (i / 9) * Math.PI * 2 + 0.3, r = 4.2 + (i % 2) * 0.6, x = Math.sin(a) * r, z = Math.cos(a) * r * 0.75 - 0.5; if (z > 2.2) return null;
      return <Person key={i} p={[x, 0, z]} h={3.0} look={crowd[i % 8]} f={f + i * 6} pose={{ mood: "angry", arms: "up", armK: 0.7 + 0.3 * Math.sin(f * 0.8 + i * 1.3), lookX: -Math.sign(x), flip: x > 0, tilt: Math.sin(f * 0.4 + i) * 0.04 }} />; })}
    <Person p={[0, 0, 0.6]} h={3.3} look={roman} f={f} pose={{ mood: "worry", arms: undefined, armR: cover > 0.1 ? [0.06, 0.8] : [0.1, 0.5 + 0.03 * Math.sin(f * 0.7)], armRK: 1, armL: cover > 0.1 ? [-0.06, 0.8] : [-0.1, 0.5 + 0.03 * Math.sin(f * 0.7)], armLK: 1, hunch: 0.9, squash: -0.2, sweat: 1, nerv: 0.85, tilt: 0.04 * Math.sin(f * 0.15), lookX: 0 }} />
    <Tear p={[0.35, 2.4, 0.2]} t={t} k={0.1} /><Tear p={[-0.35, 2.4, 0.2]} t={t} k={0.6} />
  </>);
};

/* =================== S7 32.65 – 37.65  Diodorus writes; the Eye of Horus =================== */
const K7: Key[] = [{ t: 32.5, pos: [-2.0, 3.0, 9.4], look: [0, 2.3, 0], fov: 56 }, { t: 34.6, pos: [-0.4, 2.9, 7.6], look: [0.2, 2.4, 0], fov: 52 }, { t: 36.4, pos: [0.2, 3.0, 6.8], look: [0.3, 2.6, 0], fov: 50 }, { t: 37.8, pos: [0.3, 3.0, 6.2], look: [0.3, 2.7, 0], fov: 48 }];
const Eye: React.FC<{ p: V3; s: number; k: number; t: number }> = ({ p, s, k, t }) => (
  <CanvasPlane p={p} s={[3.6 * s, 2.4 * s]} px={[360, 240]} additive={false} draw={(c, W, H) => {
    c.clearRect(0, 0, W, H); c.save(); c.translate(W / 2, H / 2); c.scale(k, k); c.strokeStyle = INK; c.lineWidth = 10; c.fillStyle = "#f6f0dc";
    c.beginPath(); c.moveTo(-140, 0); c.quadraticCurveTo(0, -110, 140, 0); c.quadraticCurveTo(0, 90, -140, 0); c.fill(); c.stroke();
    c.fillStyle = "#1d6fd1"; c.beginPath(); c.arc(Math.sin(t * 2) * 6, -4, 44, 0, 7); c.fill(); c.stroke(); c.fillStyle = INK; c.beginPath(); c.arc(Math.sin(t * 2) * 6, -4, 18, 0, 7); c.fill();
    c.strokeStyle = "#1d6fd1"; c.lineWidth = 12; c.beginPath(); c.moveTo(-40, 60); c.quadraticCurveTo(-60, 100, -20, 118); c.moveTo(60, 40); c.quadraticCurveTo(110, 40, 130, 90); c.stroke(); c.restore();
  }} />
);
const S7 = ({ t, f }: Ctx) => {
  const eye = seg(t, 36.41, 36.8, Easing.out(Easing.back(2.2))), write = t > 35.3 && t < 36.4, ink = seg(t, 35.3, 36.4, Easing.linear);
  return (<>
    <Cam t={t} keys={K7} />
    <Lights warm="#ffd9a0" />
    <Floor kind="plank" a="#7a4a28" b="#6b3f22" unit={1.8} w={30} d={24} />
    <Surface p={[0, 4.5, -4.5]} s={[30, 9]} kind="plain" a="#e0b068" b="#e0b068" unit={2} /><Surface p={[-7.5, 4.5, -2]} s={[24, 9]} rot={[0, Math.PI / 2, 0]} kind="plain" a="#d6a45c" b="#d6a45c" />
    {/* window with pyramids + sun (Egypt) */}
    <Box p={[-3.6, 4.6, -4.35]} s={[3.8, 3.8, 0.3]} color="#7a4a22" /><CanvasPlane p={[-3.6, 4.6, -4.18]} s={[3.2, 3.2]} px={[256, 256]} draw={(c, W, H) => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#6fd0f0"); g.addColorStop(1, "#ffd9a0"); c.fillStyle = g; c.fillRect(0, 0, W, H); c.fillStyle = "#fff3b0"; c.beginPath(); c.arc(W * 0.78, H * 0.22, 26, 0, 7); c.fill(); c.fillStyle = "#e9bd62"; c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(20, H * 0.82); c.lineTo(W * 0.42, H * 0.38); c.lineTo(W * 0.74, H * 0.82); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(W * 0.55, H * 0.82); c.lineTo(W * 0.8, H * 0.55); c.lineTo(W * 1.0, H * 0.82); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#d9a85a"; c.fillRect(0, H * 0.82, W, H * 0.2); }} />
    <Hiero p={[4.6, 4.2, -4.3]} s={[4.4, 5]} bg="#e9c474" ink="#8a3b12" seed={12} /><Shaft p={[-2.4, 5, -1]} s={[2.2, 9]} rot={[0, 0, 0.35]} color="255,226,150" o={0.2} />
    {/* desk, scroll, pen, lamp, shelves with scroll jars */}
    <Box p={[0.2, 1.5, 0.2]} s={[5.4, 0.22, 2.2]} color="#b98040" /><Box p={[0.2, 0.7, 0.9]} s={[5.0, 1.4, 0.4]} color="#8a5a2c" /><Box p={[0.2, 0.7, -0.4]} s={[5.0, 1.4, 0.4]} color="#7a4a22" />
    <CanvasPlane p={[0.2, 1.63, 0.55]} rot={[-1.12, 0, 0]} s={[3.0, 1.5]} px={[300, 150]} draw={(c, W, H) => { c.fillStyle = "#f6e7bd"; c.fillRect(0, 0, W, H); c.strokeStyle = "#5a3a1a"; c.lineWidth = 3; for (let i = 0; i < 7; i++) { const w = (W - 30) * clamp(ink * 7 - i); c.beginPath(); c.moveTo(16, 22 + i * 17); for (let x = 0; x < w; x += 10) c.lineTo(16 + x, 22 + i * 17 + (x % 20 ? 4 : -4)); c.stroke(); } c.strokeStyle = INK; c.lineWidth = 6; c.strokeRect(2, 2, W - 4, H - 4); }} />
    <Cyl p={[-1.9, 1.78, 0.2]} rt={0.35} h={0.2} color="#c9a227" /><Lamp p={[2.7, 1.6, 0.3]} h={1.8} color="#ffe9a8" /><Jar p={[3.4, 1.6, 0.1]} s={0.8} color="#c9a227" />
    {[0, 1, 2, 3, 4].map((i) => <Cyl key={i} p={[-6 + i * 0.7, 0.5 + (i % 2) * 0.1, -3.8]} rt={0.28} h={1.2} color={i % 2 ? "#e9d6a0" : "#d9c08a"} rot={[0, 0, Math.PI / 2 * (i % 2)]} line={2} />)}
    <Torch p={[6.4, 0, -2.5]} t={t} /><Torch p={[-6.4, 0, -2.5]} t={t} /><Palm p={[6.2, 0, -3.6]} s={1.0} lean={-0.12} t={t} /><Dust t={t} area={[6, 4, 4]} />
    <Person p={[0.2, 0.5, -0.5]} sy={0} h={3.4} look={scribe} f={f} pose={{ mood: eye > 0.3 ? "grin" : "deadpan", arms: undefined, armR: write ? [0.2 + 0.05 * Math.sin(f * 1.1), 0.42 + 0.025 * Math.cos(f * 1.7)] : eye > 0.2 ? [0.08, 0.84] : [0.3, 0.55], armRK: 1, armL: [-0.22, 0.4], armLK: 1, hunch: write ? 0.5 : 0, lookX: write ? 0 : 0, tilt: write ? 0.05 : 0 }} />
    <Eye p={[0.4, 5.6, -4.1]} s={1.5 * eye + 0.001} k={1} t={t} /><Glow p={[0.4, 5.6, -3.9]} r={3.2} color="rgba(255,220,120,1)" o={0.5 * eye} />
  </>);
};

/* =================== S8 37.65 – 40.3  ACCIDENT stamp lands, then is crossed out ("changed nothing") =================== */
const K8: Key[] = [{ t: 37.5, pos: [0.8, 9.2, 7.2], look: [0, 1.4, 0.2], fov: 52 }, { t: 38.9, pos: [0.0, 8.8, 6.4], look: [0, 1.4, 0.2], fov: 50 }, { t: 40.5, pos: [0.0, 8.4, 6.0], look: [0, 1.4, 0.2], fov: 48 }];
const S8 = ({ t, f }: Ctx) => {
  const st = seg(t, 37.9, 38.07, Easing.in(Easing.cubic)), stampY = lerp(4.6, 1.45, st) + (t > 38.07 ? 0.6 * seg(t, 38.35, 38.7) : 0), landed = t > 38.07 ? seg(t, 38.07, 38.2) : 0, X = seg(t, 38.85, 39.4, Easing.linear);
  return (<>
    <Cam t={t} keys={K8} impacts={[[38.07, 0.04]]} />
    <Lights warm="#fff2d0" />
    <Floor kind="marble" a="#ece2c8" b="#ddd0ae" unit={2.4} w={30} d={24} />
    <Box p={[0, 1.2, 0]} s={[6.4, 0.4, 3.4]} color="#b98a45" /><Box p={[-2.7, 0.5, 1.4]} s={[0.5, 1, 0.5]} color="#a47838" line={2} /><Box p={[2.7, 0.5, 1.4]} s={[0.5, 1, 0.5]} color="#a47838" line={2} />
    <Box p={[-4.4, 0.35, -2.6]} s={[1.4, 0.7, 1.4]} color="#d9a85a" line={2} /><Jar p={[-4.4, 0.7, -2.6]} s={1.1} /><Jar p={[4.6, 0, -2.4]} s={1.3} color="#2f8f9a" /><Torch p={[-5.6, 0, 1.4]} t={t} /><Torch p={[5.6, 0, 1.4]} t={t} />
    <CanvasPlane p={[0, 1.42, 0]} rot={[-Math.PI / 2, 0, 0]} s={[4.6, 3.0]} px={[460, 300]} draw={(c, W, H) => {
      c.fillStyle = "#f6e7bd"; c.fillRect(0, 0, W, H); c.strokeStyle = INK; c.lineWidth = 8; c.strokeRect(4, 4, W - 8, H - 8); c.strokeStyle = "rgba(90,58,26,.55)"; c.lineWidth = 4; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(34, 40 + i * 20); c.lineTo(W - 34 - (i % 2) * 60, 40 + i * 20); c.stroke(); }
      if (landed > 0) { c.save(); c.translate(W / 2, H * 0.62); c.rotate(-0.12); c.scale(1 + 0.15 * (1 - landed), 1 + 0.15 * (1 - landed)); c.strokeStyle = "#1f9d55"; c.lineWidth = 10; c.strokeRect(-190, -52, 380, 104); c.fillStyle = "#1f9d55"; c.font = "900 76px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("ACCIDENT", 0, 4); c.restore(); }
      if (X > 0) { c.strokeStyle = "#e5233a"; c.lineWidth = 22; c.beginPath(); c.moveTo(W * 0.14, H * 0.28); c.lineTo(lerp(W * 0.14, W * 0.86, Math.min(1, X * 2)), lerp(H * 0.28, H * 0.9, Math.min(1, X * 2))); c.stroke(); if (X > 0.5) { c.beginPath(); c.moveTo(W * 0.86, H * 0.28); c.lineTo(lerp(W * 0.86, W * 0.14, (X - 0.5) * 2), lerp(H * 0.28, H * 0.9, (X - 0.5) * 2)); c.stroke(); } }
    }} />
    {/* stamp comes down */}
    <group position={[0.1, stampY, 0.5]}><Box p={[0, 0.15, 0]} s={[1.5, 0.3, 0.8]} color="#7a4a22" line={3} /><Cyl p={[0, 0.7, 0]} rt={0.16} h={1.1} color="#a8733a" /><Ball p={[0, 1.35, 0]} r={0.3} color="#c9a227" /></group>
    {landed > 0 && landed < 1 ? <Glow p={[0, 1.7, 0.5]} r={1.8} color="rgba(255,240,200,1)" o={0.5 * (1 - landed)} /> : null}
    <Dust t={t} area={[6, 3, 4]} />
  </>);
};

/* =================== S9 40.3 – 44.9  the sacred cat outweighs an empire =================== */
const K9: Key[] = [{ t: 40.2, pos: [-1.5, 2.4, 13.5], look: [-0.5, 2.6, 0], fov: 60 }, { t: 42.6, pos: [-0.8, 2.8, 12.5], look: [-0.3, 3.0, 0], fov: 58 }, { t: 44.0, pos: [0.0, 3.6, 15.5], look: [0.0, 3.2, 0], fov: 60 }, { t: 45.0, pos: [0.0, 3.6, 16.2], look: [0.0, 3.2, 0], fov: 60 }];
const S9 = ({ t, f }: Ctx) => {
  const tilt = 0.34 * Easing.inOut(Easing.cubic)(clamp((t - 43.27) / 0.8)) - 0.02 * Math.sin(t * 5) * (1 - seg(t, 43.27, 43.5)), glow = seg(t, 41.4, 41.9);
  const cat = <FaceGroupCat t={t} />;
  const pile = <group>{[0, 1, 2].map((i) => <Box key={i} p={[-0.7 + i * 0.7, 0.35, 0]} s={[0.6, 0.7, 0.6]} color="#ffc23a" line={3} />)}<Box p={[0.1, 1.0, 0]} s={[1.8, 0.5, 0.7]} color="#ffc23a" line={3} /><Banner p={[0.6, 2.2, 0]} s={[1.2, 1.5]} color="#c8302f" draw={eagle} />
    <Cyl p={[-0.9, 1.5, 0]} rt={0.4} h={0.5} color="#d4a017" /><Ball p={[-0.9, 1.9, 0]} r={0.5} color="#e6b422" s={[1, 0.8, 1]} /></group>;
  return (<>
    <Cam t={t} keys={K9} />
    <Lights warm="#cfe6ff" />
    <Floor kind="marble" a="#1a2a5a" b="#16224a" unit={2.4} w={40} d={30} />
    <Surface p={[0, 6, -6]} s={[40, 12]} kind="plain" a="#101a42" b="#101a42" unit={2} />
    <Hiero p={[-9, 5, -5.9]} s={[8, 7]} bg="#2a3a78" ink="#ffd24a" seed={21} /><Hiero p={[9, 5, -5.9]} s={[8, 7]} bg="#2a3a78" ink="#ffd24a" seed={22} />
    {[-6, 6].map((x) => <React.Fragment key={x}><Cyl p={[x, 4.5, -3.4]} rt={0.6} h={9} color="#2a3a78" /><Cyl p={[x, 9.2, -3.4]} rt={1.0} rb={0.6} h={0.8} color="#ffc23a" /><Torch p={[x * 0.62, 0, 0.4]} t={t} h={3} /></React.Fragment>)}
    <Glow p={[-2.6, 4.2, -2]} r={9} color="rgba(255,210,90,1)" o={0.42 * glow} /><Shaft p={[-2.6, 7, -2]} s={[3.2, 12]} rot={[0, 0, 0]} color="255,226,140" o={0.28 * glow} />
    <Scales p={[0, 0, -1.4]} a={tilt} L={2.8} left={cat} right={pile} />
    {/* kneeling Egyptians bow to the cat */}
    {[-4.4, -3.1, 3.2, 4.5].map((x, i) => <Person key={i} p={[x * 1.15, 0, 1.6 - (i % 2) * 0.6]} h={2.9} look={crowd[(i * 2 + 1) % 8]} f={f + i * 5} pose={{ mood: "smile", arms: "chest", armK: 1, hunch: 1.0 * seg(t, 41.4, 41.9) + 0.2, squash: -0.18 * seg(t, 41.4, 41.9), lookX: i < 2 ? 1 : -1, flip: i >= 2 }} />)}
    <Dust t={t} area={[8, 6, 5]} color="rgba(255,230,160,.9)" />
  </>);
};
const FaceGroupCat: React.FC<{ t: number }> = ({ t }) => <FaceGroup p={[0, 0, 0.1]}><Cat p={[0, 0, 0]} h={4.2} pose="statue" t={t} /></FaceGroup>;

const CUTS = [0, 5.75, 13.5, 17.0, 22.3, 29.7, 32.65, 37.65, 40.3, 44.95];
export const CatEgypt: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  const tints = ["rgba(255,210,120,.04)", "rgba(255,150,60,.08)", "rgba(255,110,60,.10)", "rgba(255,120,60,.10)", "rgba(40,200,190,.06)", "rgba(220,50,30,.12)", "rgba(255,190,90,.08)", "rgba(255,240,200,.0)", "rgba(40,60,200,.10)"];
  const ti = CUTS.findIndex((c, i) => t >= c && t < CUTS[i + 1]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("mix.wav")} />
      <Scene first start={CUTS[0]} end={CUTS[1]} bg="#7fd6f0">{(c) => <S1 {...c} />}</Scene>
      <Scene start={CUTS[1]} end={CUTS[2]} bg="#ffb870" trans="zoom">{(c) => <S2 {...c} />}</Scene>
      <Scene start={CUTS[2]} end={CUTS[3]} bg="#ff9a62" trans="flash">{(c) => <S3 {...c} />}</Scene>
      <Scene start={CUTS[3]} end={CUTS[4]} bg="#ff8a5a" trans="whip">{(c) => <S4 {...c} />}</Scene>
      <Scene start={CUTS[4]} end={CUTS[5]} bg="#1d8f99">{(c) => <S5 {...c} />}</Scene>
      <Scene start={CUTS[5]} end={CUTS[6]} bg="#e0603a" trans="zoom">{(c) => <S6 {...c} />}</Scene>
      <Scene start={CUTS[6]} end={CUTS[7]} bg="#8a5530" trans="whip">{(c) => <S7 {...c} />}</Scene>
      <Scene start={CUTS[7]} end={CUTS[8]} bg="#d8c8a0" trans="flash">{(c) => <S8 {...c} />}</Scene>
      <Scene start={CUTS[8]} end={CUTS[9]} bg="#0b1236">{(c) => <S9 {...c} />}</Scene>
      <Grade t={t} shaft={false} tint={tints[Math.max(0, ti)]} />
      <Captions />
    </AbsoluteFill>
  );
};
void Prism; void Extrude; void Obelisk;
