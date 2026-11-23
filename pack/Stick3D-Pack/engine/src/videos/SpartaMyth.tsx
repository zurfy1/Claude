// "Did ancient Spartans really throw babies off cliffs?" — 9:16 720x1280 30fps, 55.1 s. Original script, toy-3D stick style.
// S1 cliff hook | S2 birth, father carries the bundle | S3 council of elders: strong / weak | S4 Mount Taygetus chasm, "Brutal"
// S5 Plutarch writes centuries later (timeline) | S6 2007 scientists rappel into the Keadas chasm | S7 46 people, 18-35, 0 babies
// S8 criminals / traitors / prisoners board | S9 Spartans not gentle: boys taken at 7, hard training | S10 cliff: MYTH? stamp
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, Easing, Audio, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Box, Cyl, Ball, CanvasPlane, Surface, INK } from "../style/toon";
import { Look } from "../style/puppet";
import { Person, Lights, Grade, seg, lerp, clamp, V3 } from "../style/kit";
import { Floor, Glow, Shaft, Dust, Lamp } from "../style/props";
import { Cam, Key, FaceGroup, hand } from "../style/extra";
import { Jar, Torch } from "../style/egypt";
import { Tree, Counter } from "../style/tanks";
import { Column, Temple, StoneBench, Mountain, Cliff, Chasm, Bone, Bundle, Shield, Spear, Rope, Magnifier, PosterBoard, Bowl, Stamp, Qmark } from "../style/greece";
import { Captions } from "../Main";

const FPS = 30, LEAD = 6, TAIL = 8, WALK = 3.4;
type Ctx = { t: number; f: number };
type Trans = "ghost" | "zoom" | "flash" | "whip";

const leon: Look = { skin: "#e8b98f", body: "#c8302f", outfit: "shirt", hair: "short", hairColor: "#3b2412", shoe: "#5a3420", cap: "spartan" };
const elders: Look[] = [
  { skin: "#e8c4a0", body: "#f2ead8", outfit: "shirt", hair: "grey", beard: "#e2e2ea", shoe: "#7a5a32" },
  { skin: "#d9a273", body: "#e9dcc0", outfit: "shirt", hair: "grey", beard: "#cfcfd8", shoe: "#7a5a32", glasses: false },
  { skin: "#c98e62", body: "#f2ead8", outfit: "shirt", hair: "none", beard: "#f0f0f4", shoe: "#7a5a32" },
];
const plutarch: Look = { skin: "#e0b48c", body: "#efe6d0", outfit: "shirt", hair: "grey", beard: "#9a8a7a", shoe: "#7a5a32", cap: "laurel" };
const sci: Look[] = [
  { skin: "#f1d0b0", body: "#ffffff", outfit: "blazer", shirt: "#2f8cff", hair: "short", hairColor: "#3b2412", shoe: "#2a2a2a", cap: "hardhat", glasses: true, badge: "#2f8cff" },
  { skin: "#a86b45", body: "#ffffff", outfit: "blazer", shirt: "#ff8a1c", hair: "bob", hairColor: "#111", shoe: "#2a2a2a", cap: "hardhat", badge: "#ff8a1c" },
];
const boy: Look = { skin: "#e8b98f", body: "#c8302f", outfit: "shirt", hair: "short", hairColor: "#3b2412", shoe: "#5a3420" };
const mom: Look = { skin: "#f1c9a5", body: "#4a7be0", outfit: "shirt", hair: "bob", hairColor: "#3b2412", shoe: "#5a3420" };

/* ---------- scene wrapper ---------- */
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
    <AbsoluteFill style={{ opacity: first || trans === "flash" || trans === "whip" ? 1 : k, transform: `translateX(${tx}px) scale(${sc})`, background: bg, filter: `saturate(1.25) contrast(1.06) brightness(1.03)${blur > 0.2 ? ` blur(${blur.toFixed(1)}px)` : ""}` }}>
      <ThreeCanvas width={720} height={1280} camera={{ fov: 60, position: [0, 2, 8], near: 0.1, far: 300 }} gl={{ antialias: true }}>
        <color attach="background" args={[bg]} />{children({ t, f })}
      </ThreeCanvas>
      {!first && trans === "flash" ? <AbsoluteFill style={{ background: "#fff", opacity: 1 - clamp(f / 7) }} /> : null}
    </AbsoluteFill>
  );
};
const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const Cloud: React.FC<{ p: V3; s?: number; c?: string }> = ({ p, s = 1, c = "#ffffff" }) => <group position={p} scale={s}>{[[-1.4, 0, 0, 1.2], [0, 0.5, 0, 1.6], [1.5, 0.1, 0, 1.2], [0.6, -0.3, 0.6, 1.1]].map(([x, y, z, r], i) => <Ball key={i} p={[x, y, z]} r={r} color={c} ink={0.04} />)}</group>;
const Sky: React.FC<{ t: number; n?: number; y?: number; z?: number; c?: string }> = ({ t, n = 5, y = 14, z = -40, c }) => <>{Array.from({ length: n }, (_, i) => <Cloud key={i} p={[-24 + i * 12 + Math.sin(t * 0.05 + i) * 1.5, y + rnd(i) * 5, z - rnd(i + 3) * 10]} s={1.4 + rnd(i + 7)} c={c} />)}</>;
const Range: React.FC<{ z?: number; c?: string }> = ({ z = -60, c = "#6f7f5e" }) => <>{[-40, -22, -6, 10, 28, 44].map((x, i) => <Mountain key={i} p={[x, 0, z - rnd(i) * 12]} base={26 + rnd(i + 2) * 10} h={18 + rnd(i + 5) * 10} color={i % 2 ? c : "#7d8a6a"} />)}</>;
const grass = (a = "#86b04e", b = "#7ca546") => <Floor kind="tile" a={a} b={b} unit={3} w={140} d={140} />;
const stone = (a = "#e2d6b8", b = "#d6c9a8") => <Floor kind="tile" a={a} b={b} unit={1.6} w={60} d={60} />;
const Olive: React.FC<{ p: V3; t: number; s?: number }> = ({ p, t, s = 1 }) => <Tree p={p} s={s} color="#7f9a4a" t={t} />;

/* =================== S1 0 – 2.92  the hook: a Spartan on a cliff edge, a giant question =================== */
const K1: Key[] = [{ t: 0, pos: [3.5, -5.0, 11.0], look: [0, 2.0, 0], fov: 56 }, { t: 1.6, pos: [3.0, 1.8, 9.0], look: [0, 2.6, -1], fov: 54 }, { t: 3.1, pos: [2.4, 3.0, 7.6], look: [0, 2.8, -1], fov: 52 }];
const CliffTop: React.FC<{ t: number; dusk?: boolean }> = ({ t, dusk }) => (<>
  <Lights warm={dusk ? "#ffc89a" : "#fff1d6"} />
  <Cliff p={[0, 0, 1.2]} w={16} d={20} drop={30} top="#86b04e" />
  <Box p={[0, -40, -10]} s={[200, 1, 200]} color="#5f7a46" line={1} />
  <Range z={-70} c={dusk ? "#6a5a7a" : "#6f7f5e"} /><Sky t={t} n={6} y={10} z={-50} c={dusk ? "#ffd9c4" : "#ffffff"} />
  {[-5.5, 5.8].map((x, i) => <Olive key={i} p={[x, 0, -3 - i * 2]} t={t} s={1.2} />)}
  <Column p={[-3.8, 0, -6]} h={3.2} broken /><Box p={[3.4, 0.35, -1.6]} s={[1.6, 0.7, 1.0]} color="#a8957a" /><Box p={[-2.6, 0.25, -0.4]} s={[0.9, 0.5, 0.8]} color="#9a8a70" />
  <Dust t={t} area={[10, 4, 6]} color="rgba(255,240,210,.8)" />
</>);
const S1 = ({ t, f }: Ctx) => {
  const q = seg(t, 1.0, 1.4, Easing.out(Easing.back(2.4)));
  return (<>
    <Cam t={t} keys={K1} />
    <CliffTop t={t} />
    <Person p={[0, 0, 0.2]} h={3.2} look={leon} f={f} pose={{ mood: t < 1.4 ? "deadpan" : "worry", armR: [0.3, 0.45], armRK: 1, lookX: 0, tilt: Math.sin(t * 1.2) * 0.02 }} />
    <FaceGroup p={[0, 0, 0.2]}><Shield p={[-0.25 * 3.2, 0.42 * 3.2, 0.15]} r={0.75} /><Spear p={[0.3 * 3.2, 0, 0.1]} h={4.4} /></FaceGroup>
    <Qmark p={[0, 5.6, -0.5]} s={q * 1.6 + 0.001} t={t} />
  </>);
};

/* =================== S2 2.92 – 8.74  a baby is born; the father carries it to the elders =================== */
const K2: Key[] = [{ t: 2.8, pos: [-4.4, 2.8, 8.8], look: [-4.6, 1.7, 0], fov: 54 }, { t: 6.3, pos: [-3.6, 2.8, 8.4], look: [-4.0, 1.7, 0], fov: 52 }, { t: 7.6, pos: [-1.2, 2.9, 8.8], look: [-1.0, 1.7, 0], fov: 54 }, { t: 8.9, pos: [1.0, 3.0, 9.0], look: [1.2, 1.7, 0], fov: 54 }];
const S2 = ({ t, f }: Ctx) => {
  const born = seg(t, 5.1, 5.5, Easing.out(Easing.back(2))), pick = seg(t, 6.3, 6.7), walk = Math.max(0, t - 6.79), x = -2.4 + Math.min(walk, 2.0) * 1.9, moving = t > 6.79 && t < 8.79;
  const P: V3 = [x, 0, 1.0], hy = 0.33, held = t > 6.5;
  return (<>
    <Cam t={t} keys={K2} />
    <Lights warm="#ffe2b8" />{stone()}<Sky t={t} />
    <Box p={[-4.5, 2.5, -2.6]} s={[7, 5, 0.4]} color="#e8d8b4" /><Box p={[-4.5, 5.2, -2.4]} s={[7.4, 0.4, 1.0]} color="#c2552b" line={3} />
    <Box p={[-3.0, 1.4, -2.38]} s={[1.4, 2.6, 0.1]} color="#5a3420" line={2} /><Box p={[-6.2, 3.0, -2.38]} s={[1.0, 0.9, 0.1]} color="#2a1a10" line={2} />
    <Temple p={[8, 0, -7]} w={9} n={5} h={4.6} /><Olive p={[-8.2, 0, -4]} t={t} s={1.3} /><Olive p={[3.2, 0, -5]} t={t} s={1.1} />
    <Jar p={[-1.2, 0, -1.6]} s={1.0} color="#c2552b" /><Jar p={[-0.5, 0, -1.8]} s={0.8} color="#2f8f9a" /><Bowl p={[-5.4, 0.9, -1.4]} />
    {/* cradle with the newborn */}
    <Box p={[-4.4, 0.5, 0.2]} s={[1.6, 0.5, 0.9]} color="#a8733a" /><Box p={[-4.4, 0.15, 0.2]} s={[1.8, 0.1, 1.0]} color="#7a4a22" line={2} />
    {!held ? <Bundle p={[-4.4, 0.6, 0.35]} h={1.1 * (0.3 + 0.7 * born)} t={t} glow={t > 5.1 && t < 6.4 ? "rgba(255,190,210,.9)" : undefined} /> : null}
    <Person p={[-6.4, 0, 0.8]} h={3.0} look={mom} f={f} pose={{ mood: "smile", arms: "chest", armK: 1, lookX: 1 }} />
    {/* father picks it up and walks right */}
    <Person p={held ? P : [-3.0, 0, 1.0]} h={3.2} look={leon} f={f} pose={{ mood: t < 5.6 ? "smile" : "grin", walk: Math.min(walk, 2.0) * 1.9 * WALK, speed: moving ? 0.6 : 0, armR: held ? [0.1, hy] : [lerp(0.3, -0.3, pick), lerp(0.45, 0.25, pick)], armRK: t > 6.0 ? 1 : 0, armL: held ? [-0.15, hy] : undefined, armLK: 1, flip: !held, lookX: held ? 0.5 : -1, hunch: !held ? pick * 0.6 : 0 }} />
    {held ? <FaceGroup p={P}><Bundle p={[0, hy * 3.2 - 0.32, 0.22]} h={1.3} t={t} /></FaceGroup> : null}
  </>);
};

/* =================== S3 8.74 – 13.3  the council of elders inspects: strong? weak? =================== */
const K3: Key[] = [{ t: 8.6, pos: [0.4, 3.4, 12.5], look: [0.4, 2.2, 0], fov: 56 }, { t: 10.0, pos: [0.8, 3.2, 11.2], look: [0.6, 2.0, 0], fov: 54 }, { t: 12.3, pos: [-0.2, 3.2, 11.2], look: [0.2, 2.0, 0], fov: 54 }, { t: 13.5, pos: [0, 3.8, 13.0], look: [0, 2.6, -2], fov: 56 }];
const S3 = ({ t, f }: Ctx) => {
  const strong = t >= 9.89 && t < 12.35, weak = t >= 12.35, insp = t > 9.0, mag = seg(t, 9.0, 9.4);
  const hp = seg(t, 11.6, 11.9, Easing.out(Easing.back(2.5))) * (1 - seg(t, 12.3, 12.5));
  return (<>
    <Cam t={t} keys={K3} />
    <Lights warm="#ffe9c8" />{stone("#e9dfc4", "#ddd1b2")}<Sky t={t} />
    <Temple p={[0, 0, -5.5]} w={12} n={6} h={5.0} />
    <Shaft p={[2, 5, -2]} s={[2.6, 10]} rot={[0, 0, 0.4]} color="255,236,160" o={0.16} />
    <StoneBench p={[0, 0, -1.2]} w={6.6} />
    {[-2.4, 0, 2.4].map((x, i) => <Person key={i} p={[x, 0.45, -1.1]} sy={0.9} h={2.9} look={elders[i]} f={f + i * 7} pose={{ mood: strong ? (i === 1 ? "grin" : "smile") : weak ? "worry" : "deadpan", squash: -0.18, lookX: -x * 0.3,
      arms: strong && t > 10.0 && i !== 1 ? "up" : weak && i === 2 ? "shrug" : undefined, armK: 1, armR: i === 1 && insp ? [0.3, 0.6] : undefined, armRK: mag, flip: false }} />)}
    {insp ? <FaceGroup p={[0, 0.45, -1.1]}><Magnifier p={hand(2.9, [0.3, 0.6], -0.18, false, 0.2)} s={0.9} /></FaceGroup> : null}
    <Person p={[1.8, 0, 2.8]} h={3.2} look={leon} f={f} pose={{ mood: strong ? "grin" : weak ? "gulp" : "deadpan", armR: [0.1, 0.33], armRK: 1, armL: [-0.15, 0.33], armLK: 1, flip: true, lookX: -1, sweat: weak ? 1 : 0 }} />
    <FaceGroup p={[1.8, 0, 2.8]}><Bundle p={[0, 0.33 * 3.2 - 0.32, 0.22]} h={1.3} t={t} glow={strong ? "rgba(255,215,90,.95)" : undefined} helmet={hp} /></FaceGroup>
    {strong ? <Counter p={[0.5, 5.4, 0.6]} s={[2.6, 1.1]} text="STRONG" color="#1f9d55" /> : null}
    {weak ? <Counter p={[0.5, 5.4, 0.6]} s={[2.6, 1.1]} text="WEAK?" color="#e5233a" /> : null}
    {[-6.5, 6.5].map((x) => <Torch key={x} p={[x, 0, -1]} t={t} h={2.4} />)}
  </>);
};

/* =================== S4 13.3 – 17.3  Mount Taygetus and the chasm at its foot. "Brutal." =================== */
const K4: Key[] = [{ t: 13.2, pos: [0, 12, 30], look: [0, 22, -60], fov: 56 }, { t: 15.5, pos: [0, 6, 14], look: [0, 3, -10], fov: 54 }, { t: 17.5, pos: [0.6, 5.0, 10.0], look: [0, 1.6, -3], fov: 52 }];
const S4 = ({ t, f }: Ctx) => {
  const flash = t > 16.6 && t < 16.8 ? 1 - (t - 16.6) / 0.2 : 0, br = seg(t, 16.6, 16.8, Easing.out(Easing.back(2)));
  return (<>
    <Cam t={t} keys={K4} impacts={[[16.6, 0.04]]} />
    <ambientLight intensity={1.1 + flash * 2} /><directionalLight position={[-6, 10, 4]} intensity={0.9} color="#ffb48a" />
    {grass("#6f8a4a", "#688244")}
    <Mountain p={[0, 0, -70]} base={70} h={44} color="#6a6a7a" /><Mountain p={[-46, 0, -80]} base={50} h={32} color="#5f6a5a" /><Mountain p={[44, 0, -82]} base={54} h={34} color="#5f6a5a" />
    <Sky t={t} n={6} y={52} z={-100} c="#8a7a9a" />
    <Chasm p={[0, 0, -2]} w={3.2} l={11} rotY={0.12} />
    {Array.from({ length: 6 }, (_, i) => <Box key={i} p={[(i % 2 ? 1 : -1) * (4 + rnd(i) * 4), 0.3, -6 + i * 1.4]} s={[1.2, 0.6, 0.9]} rot={[0, i, 0]} color="#8a8070" line={2} />)}
    {[-9, 9, -7, 8].map((x, i) => <Tree key={i} p={[x, 0, -10 - i * 3]} s={1.3} bare t={t} />)}
    <CanvasPlane p={[0, 50, -60]} s={[24, 4.5]} px={[640, 120]} face draw={(c, W, H) => { c.clearRect(0, 0, W, H); c.fillStyle = "#fff"; c.strokeStyle = INK; c.lineWidth = 10; c.font = "900 84px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.strokeText("MT. TAYGETUS", W / 2, H / 2); c.fillText("MT. TAYGETUS", W / 2, H / 2); }} />
    <Stamp p={[0, 3.2, -1]} text="BRUTAL" k={br} s={[6, 1.9]} />
    <Glow p={[0, 8, -10]} r={18} color="rgba(255,255,255,1)" o={0.8 * flash} />
    <Dust t={t} area={[10, 4, 8]} color="rgba(220,210,255,.7)" />
    {void f}
  </>);
};

/* =================== S5 17.3 – 25.45  Plutarch wrote it centuries later; he never saw it =================== */
const K5: Key[] = [{ t: 17.2, pos: [-0.6, 3.8, 10.8], look: [0, 3.2, -1], fov: 54 }, { t: 21.0, pos: [0.4, 3.8, 10.4], look: [0.2, 3.3, -1], fov: 54 }, { t: 23.6, pos: [0, 4.0, 10.0], look: [0, 3.4, -1], fov: 54 }, { t: 25.6, pos: [0.4, 3.6, 9.6], look: [0.2, 3.0, -1], fov: 52 }];
const S5 = ({ t, f }: Ctx) => {
  const scratch = t > 17.4 && t < 17.7, tl = seg(t, 21.27, 22.9, Easing.inOut(Easing.cubic)), write = t < 23.9, shrug = seg(t, 24.0, 24.3);
  return (<>
    <Cam t={t} keys={K5} impacts={scratch ? [[17.4, 0.03]] : []} />
    <Lights warm="#ffd9a0" />
    <Floor kind="plank" a="#8a5a32" b="#7a4e2a" unit={1.8} w={30} d={24} />
    <Surface p={[0, 4.5, -4.2]} s={[30, 9]} kind="plain" a="#e6cfa0" b="#e6cfa0" unit={2} />
    {[-6, 6].map((x) => <Column key={x} p={[x, 0, -3.6]} h={6.5} color="#f2e6cc" />)}
    {/* timeline banner */}
    <CanvasPlane p={[0, 5.4, -4.05]} s={[8, 2.13]} px={[900, 240]} frame="#5a3420" draw={(c, W, H) => {
      c.fillStyle = "#f6e7bd"; c.fillRect(0, 0, W, H); c.strokeStyle = INK; c.lineWidth = 8; c.beginPath(); c.moveTo(60, H * 0.55); c.lineTo(60 + (W - 120) * tl, H * 0.55); c.stroke();
      c.fillStyle = "#c8302f"; c.beginPath(); c.arc(60, H * 0.55, 18, 0, 7); c.fill(); c.stroke(); c.font = "900 44px Inter, Arial"; c.textAlign = "left"; c.textBaseline = "middle"; c.fillStyle = "#c8302f"; c.fillText("SPARTA", 30, H * 0.22); c.fillStyle = INK; c.font = "800 34px Inter, Arial"; c.fillText("~500 BC", 30, H * 0.83);
      if (tl > 0.98) { c.fillStyle = "#2f8cff"; c.beginPath(); c.arc(W - 60, H * 0.55, 18, 0, 7); c.fill(); c.stroke(); c.textAlign = "right"; c.font = "900 44px Inter, Arial"; c.fillText("PLUTARCH", W - 30, H * 0.22); c.fillStyle = INK; c.font = "800 34px Inter, Arial"; c.fillText("~100 AD", W - 30, H * 0.83); }
      if (tl > 0.3) { c.textAlign = "center"; c.fillStyle = "#7a3b12"; c.font = "900 38px Inter, Arial"; c.fillText(`${Math.round(tl * 600)} YEARS`, W / 2, H * 0.3); }
    }} />
    {/* desk + scroll */}
    <Box p={[0.2, 1.5, 0.2]} s={[5.0, 0.22, 2.0]} color="#b98040" /><Box p={[0.2, 0.7, 0.9]} s={[4.6, 1.4, 0.4]} color="#8a5a2c" /><Box p={[0.2, 0.7, -0.4]} s={[4.6, 1.4, 0.4]} color="#7a4a22" />
    <CanvasPlane p={[0.2, 1.63, 0.55]} rot={[-1.12, 0, 0]} s={[2.8, 1.4]} px={[280, 140]} draw={(c, W, H) => { c.fillStyle = "#f6e7bd"; c.fillRect(0, 0, W, H); c.strokeStyle = "#5a3a1a"; c.lineWidth = 3; const ink = clamp((t - 17.3) / 5); for (let i = 0; i < 6; i++) { const w = (W - 30) * clamp(ink * 6 - i); c.beginPath(); c.moveTo(16, 22 + i * 18); for (let x = 0; x < w; x += 10) c.lineTo(16 + x, 22 + i * 18 + (x % 20 ? 4 : -4)); c.stroke(); } c.strokeStyle = INK; c.lineWidth = 6; c.strokeRect(2, 2, W - 4, H - 4); }} />
    <Lamp p={[2.6, 1.6, 0.3]} h={1.6} color="#ffe9a8" /><Jar p={[-2.0, 1.6, 0.2]} s={0.6} color="#c9a227" />
    {[0, 1, 2, 3].map((i) => <Cyl key={i} p={[-5 + i * 0.6, 0.35, -3.0]} rt={0.25} h={1.1} color={i % 2 ? "#e9d6a0" : "#d9c08a"} rot={[0, 0, Math.PI / 2]} line={2} />)}
    <Person p={[0.2, 0.5, -0.5]} sy={0} h={3.4} look={plutarch} f={f} pose={{ mood: t < 23.9 ? "deadpan" : "worry", armR: write ? [0.2 + 0.05 * Math.sin(f * 1.1), 0.42 + 0.025 * Math.cos(f * 1.7)] : undefined, armRK: 1 - shrug, arms: shrug > 0 ? "shrug" : undefined, armK: shrug, armL: write ? [-0.22, 0.4] : undefined, armLK: 1 - shrug, hunch: write ? 0.4 : 0 }} />
    {t > 24.0 ? <Qmark p={[1.6, 4.6, 0]} s={0.7 * seg(t, 24.0, 24.3, Easing.out(Easing.back(2))) + 0.001} t={t} /> : null}
  </>);
};

/* =================== S6 25.45 – 32.6  2007: scientists rappel into the Keadas chasm =================== */
const K6: Key[] = [{ t: 25.3, pos: [0, 4.0, 16], look: [0, 1.5, 0], fov: 56 }, { t: 27.6, pos: [0.4, 2.0, 14], look: [0, -2.5, 0], fov: 56 }, { t: 30.0, pos: [0.4, -4.0, 13], look: [0, -7.5, 0], fov: 56 }, { t: 32.8, pos: [0.4, -9.0, 11], look: [0, -11.5, 0], fov: 54 }];
const S6 = ({ t, f }: Ctx) => {
  const yr = seg(t, 25.85, 26.3, Easing.out(Easing.back(2))), d = (k: number) => Math.min(13.2, Math.max(0, t - 27.7 - k * 0.4) * 3.2);
  return (<>
    <Cam t={t} keys={K6} />
    <ambientLight intensity={1.3} /><directionalLight position={[4, 10, 6]} intensity={1.0} color="#fff0d8" />
    {/* cross-section of the chasm: two rock walls, floor at y=-14 */}
    {[-1, 1].map((sd) => <React.Fragment key={sd}><Box p={[sd * 6.5, -7, -1]} s={[7, 14, 8]} color="#8a6a48" /><Box p={[sd * 6.5, 0.1, -1]} s={[7.1, 0.2, 8.1]} color="#86b04e" line={3} />
      {Array.from({ length: 6 }, (_, i) => <Box key={i} p={[sd * 3.0, -1.5 - i * 2.2, 1.6 - (i % 2) * 0.6]} s={[0.4, 1.4, 1.0]} color={i % 2 ? "#7a5a3a" : "#9a7a52"} line={2} />)}</React.Fragment>)}
    <Box p={[0, -14.1, -1]} s={[6, 0.2, 8]} color="#5a4430" line={2} /><Box p={[0, -7, -4.8]} s={[6, 14, 0.4]} color="#3a2a1a" line={1} />
    <Sky t={t} n={4} y={12} z={-30} /><Olive p={[-7.5, 0, -2]} t={t} s={1.2} /><Olive p={[7.8, 0, -3]} t={t} s={1.1} />
    {Array.from({ length: 9 }, (_, i) => <Bone key={i} p={[-1.8 + (i % 5) * 0.9, -13.9, -1.5 + Math.floor(i / 5) * 1.2]} rot={[Math.PI / 2, 0, i * 0.7]} s={1.1} />)}
    {t > 30.9 ? <Glow p={[0, -13.4, -0.8]} r={3} color="rgba(255,240,170,1)" o={0.5 * seg(t, 30.9, 31.5)} /> : null}
    <Counter p={[0, 4.8, 0]} s={[3.6, 1.6]} text="2007" color="#2f8cff" sub="KEADAS CHASM" />
    {[0, 1].map((k) => { const x = k ? 1.2 : -1.2, y = -d(k); return <React.Fragment key={k}>
      <Rope a={[x, 0.4, 0.4]} b={[x, y + 2.6, 0.4]} />
      <Person p={[x, y, 0.5]} sy={y > -13.9 ? -14 : y} shadow={y <= -13.1} h={2.6} look={sci[k]} f={f + k * 9} pose={{ mood: y > -13 ? "worry" : "smile", armR: [0.05, 0.9], armRK: y > -13 ? 1 : 0, armL: [-0.05, 0.85], armLK: y > -13 ? 1 : 0, air: y > -13 ? 1 : 0, lookX: 0 }} />
      <Glow p={[x, y + 2.45, 0.8]} r={0.8} color="rgba(255,250,200,1)" o={0.7} /></React.Fragment>; })}
    {void yr}
  </>);
};

/* =================== S7 32.6 – 40.58  46 people, all 18-35, not one baby =================== */
const K7: Key[] = [{ t: 32.5, pos: [0, 4.6, 13.5], look: [0, 2.0, -1], fov: 56 }, { t: 36.0, pos: [0.6, 4.4, 13.0], look: [0.3, 2.2, -1], fov: 56 }, { t: 39.4, pos: [-0.4, 4.2, 12.4], look: [0, 2.2, -1], fov: 54 }, { t: 40.8, pos: [-0.4, 4.2, 12.0], look: [0, 2.2, -1], fov: 54 }];
const S7 = ({ t, f }: Ctx) => {
  const n = Math.round(46 * seg(t, 33.85, 34.6, Easing.out(Easing.quad))), age = seg(t, 38.2, 38.6, Easing.out(Easing.back(2))), zero = seg(t, 39.5, 39.9, Easing.out(Easing.back(2))), stamp = seg(t, 40.04, 40.2);
  const lamp = (x: number) => <Glow p={[x, 2.2, 0.6]} r={1.2} color="rgba(255,250,200,1)" o={0.5} />;
  return (<>
    <Cam t={t} keys={K7} impacts={[[40.04, 0.03]]} />
    <ambientLight intensity={1.2} /><directionalLight position={[2, 8, 6]} intensity={0.9} color="#fff0d8" />
    <Floor kind="tile" a="#6a5238" b="#5f4a32" unit={1.6} w={40} d={40} />
    <Surface p={[0, 5, -4.5]} s={[30, 10]} kind="plain" a="#5a4430" b="#5a4430" unit={2} />
    {[-6, 6].map((x) => <Box key={x} p={[x, 3, -1]} s={[2, 8, 8]} color="#7a5a3a" />)}
    <Box p={[0, 0.03, 0.4]} s={[7, 0.05, 3.6]} color="#e8eef5" line={2} />
    {Array.from({ length: 14 }, (_, i) => <Bone key={i} p={[-2.9 + (i % 7) * 0.95, 0.15, -0.6 + Math.floor(i / 7) * 1.6]} rot={[Math.PI / 2, 0, (i % 3) * 0.4]} s={1.0} />)}
    {Array.from({ length: 6 }, (_, i) => <CanvasPlane key={i} p={[-2.4 + i * 0.95, 0.08, 1.4]} rot={[-Math.PI / 2, 0, 0]} s={[0.6, 0.35]} px={[60, 35]} draw={(c, W, H) => { c.fillStyle = "#ffe27a"; c.fillRect(0, 0, W, H); c.strokeStyle = INK; c.lineWidth = 3; c.strokeRect(1, 1, W - 2, H - 2); c.fillStyle = INK; c.font = "900 20px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(String(18 + i * 3), W / 2, H / 2 + 1); }} />)}
    <Counter p={[-1.7, 5.0, -1]} s={[2.9, 1.5]} text={String(n)} sub="PEOPLE" color={INK} />
    {age > 0 ? <Counter p={[1.7, 5.0, -1]} s={[2.9 * age + 0.01, 1.5 * age + 0.01]} text="18–35" sub="YEARS OLD" color="#2f8cff" /> : null}
    {zero > 0 ? <Counter p={[0, 3.0, 1.2]} s={[2.8 * zero + 0.01, 1.4 * zero + 0.01]} text="0" sub="BABIES" color="#e5233a" /> : null}
    {[0, 1].map((k) => <React.Fragment key={k}><Person p={[k ? 3.0 : -3.0, 0, 1.4]} h={2.8} look={sci[k]} f={f + k * 9} pose={{ mood: t > 39.5 ? (k ? "shock" : "deadpan") : "smile", arms: t > 39.6 && k ? "shrug" : undefined, armK: 1, armR: !k && t < 39.5 ? [0.32, 0.5] : undefined, armRK: 1, flip: k === 1, lookX: k ? -1 : 1 }} />{lamp(k ? 3.0 : -3.0)}</React.Fragment>)}
    {t < 39.5 ? <FaceGroup p={[-3.0, 0, 1.4]}><Magnifier p={hand(2.8, [0.32, 0.5], 0, false, 0.2)} s={0.8} /></FaceGroup> : null}
    {void stamp}
  </>);
};

/* =================== S8 40.58 – 44.85  the pit was for criminals, traitors, prisoners of war =================== */
const K8: Key[] = [{ t: 40.4, pos: [-4.0, 3.6, 13.0], look: [0, 2.4, 0], fov: 56 }, { t: 42.2, pos: [-1.2, 3.4, 11.5], look: [0, 2.5, 0], fov: 54 }, { t: 45.0, pos: [1.6, 3.4, 11.0], look: [0.4, 2.5, 0], fov: 54 }];
const S8 = ({ t, f }: Ctx) => {
  const k = (t0: number) => seg(t, t0, t0 + 0.3, Easing.out(Easing.back(2.2)));
  return (<>
    <Cam t={t} keys={K8} />
    <Lights warm="#ffd9b0" />{grass()}<Sky t={t} /><Range z={-60} />
    <Chasm p={[0, 0, 2.6]} w={2.4} l={12} rotY={0.05} />
    <PosterBoard p={[0, 0, -1.2]} items={[{ text: "CRIMINALS", k: k(42.34) }, { text: "TRAITORS", k: k(43.06) }, { text: "PRISONERS\nOF WAR", k: k(43.74) }]} />
    {[-6, 6.5].map((x, i) => <Olive key={i} p={[x, 0, -4]} t={t} s={1.3} />)}
    <Torch p={[-3.6, 0, -0.8]} t={t} h={2.4} /><Torch p={[3.6, 0, -0.8]} t={t} h={2.4} />
    <Person p={[4.4, 0, 0.6]} h={2.8} look={sci[0]} f={f} pose={{ mood: "deadpan", arms: "point", armK: seg(t, 42.2, 42.5), flip: true, lookX: -1 }} />
  </>);
};

/* =================== S9 44.85 – 51.2  not gentle: boys taken at seven, trained through hunger and beatings =================== */
const K9: Key[] = [{ t: 44.7, pos: [0, 2.6, 6.6], look: [0, 2.2, 0], fov: 50 }, { t: 46.6, pos: [0, 2.6, 6.0], look: [0, 2.3, 0], fov: 48 }, { t: 47.6, pos: [3.0, 3.4, 12], look: [3.4, 1.8, -1], fov: 54 }, { t: 49.2, pos: [6.5, 4.2, 14], look: [8.5, 1.4, -2], fov: 56 }, { t: 51.4, pos: [8.5, 4.2, 13], look: [9.5, 1.4, -2], fov: 56 }];
const S9 = ({ t, f }: Ctx) => {
  const no = t > 46.4 && t < 47.0, leave = Math.max(0, t - 47.6), seven = seg(t, 48.5, 48.9, Easing.out(Easing.back(2)));
  return (<>
    <Cam t={t} keys={K9} />
    <Lights warm="#ffd9a0" />
    <Floor kind="tile" a="#d9b47a" b="#cfa86e" unit={2.2} w={80} d={60} /><Sky t={t} /><Range z={-60} />
    <Box p={[-1.5, 2.5, -2.6]} s={[7, 5, 0.4]} color="#e8d8b4" /><Box p={[-1.5, 5.2, -2.4]} s={[7.4, 0.4, 1.0]} color="#c2552b" line={3} /><Box p={[0.6, 1.4, -2.38]} s={[1.4, 2.6, 0.1]} color="#5a3420" line={2} />
    <Person p={[-1.6, 0, -0.4]} h={3.0} look={mom} f={f} pose={{ mood: t > 47.6 ? "worry" : "smile", arms: t > 47.8 ? "chest" : undefined, armK: 1, lookX: 1 }} />
    {/* close-up "No." then he leads the boy away to the training ground */}
    <Person p={[lerp(0, 4.0, clamp(leave / 1.4)), 0, 1.2]} h={3.2} look={leon} f={f} pose={{ mood: t < 46.4 ? "deadpan" : "angry", lookX: no ? Math.sin(t * 30) : leave > 0 ? 1 : 0, walk: lerp(0, 4.0, clamp(leave / 1.4)) * WALK, speed: leave > 0 && leave < 1.4 ? 0.6 : 0, armL: leave > 0 ? [-0.3, 0.3] : undefined, armLK: 1 }} />
    {t > 47.4 ? <Person p={[lerp(-1.0, 2.9, clamp(leave / 1.4)), 0, 1.4]} h={1.9} look={boy} f={f + 5} pose={{ mood: "worry", walk: lerp(-1.0, 2.9, clamp(leave / 1.4)) * WALK * 1.5, speed: leave > 0 && leave < 1.4 ? 0.7 : 0, armR: [0.3, 0.55], armRK: 1, lookX: -1 }} /> : null}
    {seven > 0 ? <Counter p={[9.2, 4.4, -1.0]} s={[3.6 * seven + 0.01, 1.5 * seven + 0.01]} text="AGE 7" color="#c8302f" /> : null}
    {/* training ground: boys in a line, empty bowls, instructor with a stick */}
    {[0, 1, 2, 3].map((i) => <React.Fragment key={i}><Person p={[7.4 + i * 1.2, 0, -1.2 - (i % 2) * 0.3]} h={1.9} look={boy} f={f + i * 6} pose={{ mood: t > 50.4 ? "gulp" : "worry", sweat: 1, nerv: t > 50.4 ? 0.6 : 0.2, hunch: 0.4, arms: t > 49.9 && t < 50.5 ? "chest" : undefined, armK: 1, lookX: 1 }} /><Bowl p={[7.4 + i * 1.2, 0, -0.2]} /></React.Fragment>)}
    <Person p={[12.6, 0, 0.2]} h={3.2} look={{ ...leon, beard: "#3b2412" }} f={f} pose={{ mood: "angry", armR: [0.3, 0.75 + 0.1 * Math.sin(t * 8)], armRK: 1, flip: true, lookX: -1 }} />
    <FaceGroup p={[12.6, 0, 0.2]}><Box p={hand(3.2, [0.3, 0.75 + 0.1 * Math.sin(t * 8)], 0, true, 0.15)} s={[0.07, 1.4, 0.07]} rot={[0, 0, 0.5 + Math.sin(t * 8) * 0.3]} color="#8a5a32" line={1} /></FaceGroup>
    <Shield p={[14.6, 1.0, -2.2]} r={0.8} rot={[0, -0.4, 0.2]} /><Spear p={[15.2, 0, -2.4]} h={4.2} rot={[0, 0, 0.12]} />
    {[16.5, 5.5].map((x) => <Olive key={x} p={[x, 0, -4.5]} t={t} s={1.2} />)}
  </>);
};

/* =================== S10 51.2 – 55.15  back on the cliff: MYTH? =================== */
const K10: Key[] = [{ t: 51.1, pos: [3.4, 3.2, 9.4], look: [0, 3.0, -1], fov: 54 }, { t: 53.5, pos: [2.0, 3.6, 11.0], look: [0, 3.4, -1], fov: 56 }, { t: 55.3, pos: [1.4, 4.4, 14.0], look: [0, 3.4, -1], fov: 58 }];
const S10 = ({ t, f }: Ctx) => {
  const st = seg(t, 54.55, 54.75, Easing.in(Easing.quad)), land = t > 54.75;
  return (<>
    <Cam t={t} keys={K10} impacts={[[54.75, 0.05]]} />
    <CliffTop t={t} dusk />
    <Glow p={[-10, 6, -50]} r={14} color="rgba(255,160,110,1)" o={0.5} />
    <Person p={[0, 0, 0.2]} h={3.2} look={leon} f={f} pose={{ mood: t < 53 ? "worry" : land ? "grin" : "deadpan", arms: t > 52.6 ? "shrug" : undefined, armK: 1, lookX: 0 }} />
    <FaceGroup p={[0, 0, 0.2]}><Spear p={[0.3 * 3.2, 0, 0.1]} h={4.4} /></FaceGroup>
    <Shield p={[-1.6, 0.8, 0.0]} r={0.75} rot={[0, 0.2, 0.3]} />
    <Qmark p={[0, 5.6, -0.5]} s={1.6} t={t} />
    <Stamp p={[0, 5.4, 0.2]} text="MYTH?" k={land ? 1 : st} s={[4.6, 1.8]} />
    {land && t < 55.1 ? <Glow p={[0, 5.4, 0.4]} r={3} color="rgba(255,255,255,1)" o={0.7 * (1 - seg(t, 54.75, 55.1))} /> : null}
  </>);
};

const CUTS = [0, 2.92, 8.74, 13.3, 17.3, 25.45, 32.6, 40.58, 44.85, 51.2, 55.15];
export const SpartaMyth: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("mix.wav")} />
      <Scene first start={CUTS[0]} end={CUTS[1]} bg="#8cc8f0">{(c) => <S1 {...c} />}</Scene>
      <Scene start={CUTS[1]} end={CUTS[2]} bg="#8cc8f0" trans="whip">{(c) => <S2 {...c} />}</Scene>
      <Scene start={CUTS[2]} end={CUTS[3]} bg="#8cc8f0" trans="whip">{(c) => <S3 {...c} />}</Scene>
      <Scene start={CUTS[3]} end={CUTS[4]} bg="#5a5070" trans="zoom">{(c) => <S4 {...c} />}</Scene>
      <Scene start={CUTS[4]} end={CUTS[5]} bg="#3a2418" trans="flash">{(c) => <S5 {...c} />}</Scene>
      <Scene start={CUTS[5]} end={CUTS[6]} bg="#8cc8f0" trans="whip">{(c) => <S6 {...c} />}</Scene>
      <Scene start={CUTS[6]} end={CUTS[7]} bg="#2a1e14">{(c) => <S7 {...c} />}</Scene>
      <Scene start={CUTS[7]} end={CUTS[8]} bg="#8cc8f0" trans="whip">{(c) => <S8 {...c} />}</Scene>
      <Scene start={CUTS[8]} end={CUTS[9]} bg="#8cc8f0" trans="zoom">{(c) => <S9 {...c} />}</Scene>
      <Scene start={CUTS[9]} end={CUTS[10]} bg="#f3b48a" trans="whip">{(c) => <S10 {...c} />}</Scene>
      <Grade t={t} shaft={false} tint={t < 13.3 ? "rgba(255,220,150,.04)" : t < 17.3 ? "rgba(80,40,120,.12)" : t < 25.45 ? "rgba(255,170,80,.06)" : t < 40.58 ? "rgba(255,200,120,.05)" : "rgba(255,170,100,.06)"} />
      <Captions />
    </AbsoluteFill>
  );
};
