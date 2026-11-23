// "Tanks you can fix" — T-34 vs Tiger. 9:16 720x1280 30fps, 64.5 s. Style study of a toy-3D WW2 short (original script/voice).
// S1 Soviet yard: 3 wrecks roll in, parts float up and shuffle like cards | S2 German garage: one Tiger polished for months
// S3 parts slam back, three tanks drive away | S4 1942: Tiger bursts through the wall | S5 wheat road: one-mile shot, bounces, kill rings
// S6 autumn rain, mud, Tiger sinks | S7 winter: wheels freeze, gearbox cracks | S8 pocket watch + month calendar
// S9 Soviet drops a broken engine, grabs another | S10 1,300 vs 50,000 | S11 same underneath -> spare-parts shop | S12 finale
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, Easing, Audio, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Box, Cyl, Ball, CanvasPlane, Surface, INK } from "../style/toon";
import { Look } from "../style/puppet";
import { Person, Lights, Grade, Calendar, Clock, Desk, seg, lerp, clamp, V3 } from "../style/kit";
import { Floor, Glow, Shaft, Dust } from "../style/props";
import { Cam, Key, camAt, FaceGroup, hand } from "../style/extra";
import { T34, Tiger, BrickFactory, Garage, Fence, Gantry, PowerPole, Tree, Weather, PocketWatch, TapeMeasure, EngineBlock, Counter } from "../style/tanks";
import { Captions } from "../Main";

const FPS = 30, LEAD = 6, TAIL = 8, WALK = 3.4;
type Ctx = { t: number; f: number };
type Trans = "ghost" | "zoom" | "flash" | "whip";

const ivan: Look = { skin: "#f3cba6", body: "#7a8a3e", outfit: "shirt", hair: "short", hairColor: "#5a3420", shoe: "#2a1a12", cap: "ushanka", capColor: "#6b4a2a", mustache: "#7a3a1a", badge: "#e53e3e" };
const hans: Look = { skin: "#f6dcc4", body: "#7d8790", outfit: "suit", tie: "#1b1b2a", hair: "swept", hairColor: "#e8d27a", shoe: "#111111", cap: "peaked", capColor: "#5d666e", monocle: true };

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
const Cloud: React.FC<{ p: V3; s?: number }> = ({ p, s = 1 }) => <group position={p} scale={s}>{[[-1.4, 0, 0, 1.2], [0, 0.5, 0, 1.6], [1.5, 0.1, 0, 1.2], [0.6, -0.3, 0.6, 1.1]].map(([x, y, z, r], i) => <Ball key={i} p={[x, y, z]} r={r} color="#ffffff" ink={0.04} />)}</group>;
const Sky: React.FC<{ t: number; n?: number; y?: number; z?: number }> = ({ t, n = 5, y = 14, z = -40 }) => <>{Array.from({ length: n }, (_, i) => <Cloud key={i} p={[-24 + i * 12 + Math.sin(t * 0.05 + i) * 1.5, y + rnd(i) * 5, z - rnd(i + 3) * 10]} s={1.4 + rnd(i + 7)} />)}</>;
const dirt = (a = "#7a5a3a", b = "#6e5032") => <Floor kind="tile" a={a} b={b} unit={3.2} w={90} d={90} />;
const cobble = () => <Floor kind="tile" a="#9a9890" b="#8c8a82" unit={0.7} w={50} d={50} />;
const snowF = () => <Floor kind="tile" a="#eef3fb" b="#e2e9f5" unit={2.6} w={120} d={120} />;
const Wrench: React.FC<{ p: V3; rot?: number }> = ({ p, rot = 0 }) => <group position={p} rotation={[0, 0, rot]}><Box p={[0, 0, 0]} s={[0.1, 0.8, 0.06]} color="#aab2bc" line={1} /><Box p={[0, 0.42, 0]} s={[0.3, 0.16, 0.06]} color="#aab2bc" line={1} /></group>;
const Hammer: React.FC<{ p: V3; rot?: number }> = ({ p, rot = 0 }) => <group position={p} rotation={[0, 0, rot]}><Box p={[0, 0.3, 0]} s={[0.09, 0.8, 0.09]} color="#8a5a32" line={1} /><Box p={[0, 0.72, 0]} s={[0.45, 0.2, 0.2]} color="#4a4f58" line={2} /></group>;
const Spark: React.FC<{ p: V3; t: number; t0: number; n?: number; color?: string }> = ({ p, t, t0, n = 7, color = "#ffd23a" }) => { const d = t - t0; if (d < 0 || d > 0.6) return null; return <>{Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2 + 0.3, v = 3 + rnd(i) * 2; return <Ball key={i} p={[p[0] + Math.cos(a) * v * d, p[1] + (Math.sin(a) * 0.6 + 0.8) * v * d - 6 * d * d, p[2] + Math.sin(a) * 0.5 * v * d]} r={0.06} color={color} ink={0} />; })}<Glow p={p} r={1.2} color="rgba(255,230,140,1)" o={0.8 * (1 - d / 0.6)} /></>; };

/* ---------- shared Soviet-yard layout (S1 + S3) ---------- */
const TP: V3[] = [[-4.4, 0, -2.2], [0.2, 0, -4.4], [4.6, 0, -2.4]], TROT = [0.35, 0.15, -0.1], TNUM = ["3", "7", "12"];
// 9 floating parts: 3 turrets (k 0-2), 6 wheels (k 3-8); ring centre above the yard
const RC: V3 = [0.2, 4.6, -2.6];
const ringP = (k: number, a: number): V3 => { const ang = k / 9 * Math.PI * 2 + a; return [RC[0] + Math.cos(ang) * 4.2, RC[1] + Math.sin(ang * 2) * 0.5, RC[2] + Math.sin(ang) * 1.6]; };
const homeP = (k: number): V3 => k < 3 ? [TP[k][0] - 0.25, 1.5, TP[k][2]] : [TP[(k - 3) % 3][0] + (k < 6 ? -1 : 1), 0.46, TP[(k - 3) % 3][2] + 1.5];
const SoviYard: React.FC<{ t: number }> = ({ t }) => (<>
  <Lights warm="#fff1d6" />{dirt()}<Sky t={t} />
  <BrickFactory p={[-2, 0, -12]} w={22} h={5.5} d={5} teeth={5} /><BrickFactory p={[14, 0, -16]} w={12} h={4.5} d={4} teeth={3} />
  {[-12, -9, 10.5, 13].map((x, i) => <Tree key={i} p={[x, 0, -8 - (i % 2) * 2]} s={1.2} t={t} />)}
  <Fence p={[8.6, 0, -1]} L={14} rotY={Math.PI / 2} /><Fence p={[-2, 0, -8.4]} L={20} />
  {[[-7.6, 1.2], [-6.8, 2.4], [7.0, 2.8]].map(([x, z], i) => <Cyl key={i} p={[x, 0.55, z]} rt={0.42} h={1.1} color={["#3a4a2a", "#4a4a4a", "#7a4a22"][i]} />)}
  <Box p={[-6.4, 0.45, -4.6]} s={[1.6, 0.9, 1.1]} color="#8a6a3a" /><Box p={[6.6, 0.4, -5.4]} s={[1.2, 0.8, 1.2]} color="#7a5a32" />
  {[0, 1, 2, 3].map((i) => <Cyl key={i} p={[-7.8 + i * 0.4, 0.2, -6.2 + (i % 2) * 0.3]} rt={0.42} h={0.14} color="#4f7a3a" rot={[Math.PI / 2, 0, 0.3 * i]} line={2} />)}
  <Dust t={t} area={[10, 4, 6]} color="rgba(255,240,210,.8)" />
</>);
const FloatPart: React.FC<{ k: number; p: V3; spin: number; num: string }> = ({ k, p, spin, num }) => k < 3
  ? <group position={p} rotation={[0, spin, 0]}><T34 p={[0.25, -1.5, 0]} noTurret={false} num={num} s={1} wheelsOff={5} {...{}} /></group>
  : <group position={p} rotation={[spin, 0, spin * 0.6]}><Cyl p={[0, 0, 0]} rt={0.4} h={0.16} color="#4f7a3a" rot={[Math.PI / 2, 0, 0]} line={2} /><Cyl p={[0, 0, 0.09]} rt={0.12} h={0.04} color="#2a2a22" rot={[Math.PI / 2, 0, 0]} line={1} /></group>;
// turret-only floating piece (hull hidden): reuse T34 turret by clipping — simpler: dedicated mesh
const Turret: React.FC<{ p: V3; yaw?: number; num?: string; tilt?: number }> = ({ p, yaw = 0, num = "3", tilt = 0 }) => (
  <group position={p} rotation={[tilt, yaw, tilt * 0.5]}>
    <Box p={[0, 0.38, 0]} s={[1.9, 0.76, 1.7]} color="#4f7a3a" /><Cyl p={[2.05, 0.38, 0]} rt={0.075} h={2.3} color="#4f7a3a" rot={[0, 0, -Math.PI / 2]} line={2} /><Box p={[1.05, 0.38, 0]} s={[0.3, 0.42, 0.5]} color="#4f7a3a" line={2} />
    <CanvasPlane p={[0, 0.38, 0.86]} s={[0.7, 0.5]} px={[70, 50]} draw={(c, W, H) => { c.clearRect(0, 0, W, H); c.fillStyle = "#fff"; c.font = "900 44px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(num, W / 2, H / 2 + 2); }} />
  </group>
);
const Wheel: React.FC<{ p: V3; r?: number; rot?: number }> = ({ p, r = 0.4, rot = 0 }) => (
  <group position={p} rotation={[rot * 0.7, rot, 0]}><Cyl p={[0, 0, 0]} rt={r} h={0.16} color="#4f7a3a" rot={[Math.PI / 2, 0, 0]} line={2} /><Cyl p={[0, 0, 0.09]} rt={r * 0.3} h={0.04} color="#2a2a22" rot={[Math.PI / 2, 0, 0]} line={1} /></group>
);
void FloatPart;

/* =================== S1 0 – 7.1 =================== */
const K1: Key[] = [
  { t: 0, pos: [-6, 6.5, 13], look: [-1, 1.2, -2], fov: 58 }, { t: 2.6, pos: [-2.5, 5.2, 11.5], look: [0, 1.6, -2.5], fov: 56 },
  { t: 4.9, pos: [0.5, 4.6, 12.5], look: [0.2, 2.6, -2.5], fov: 58 }, { t: 7.3, pos: [2.4, 3.8, 11.0], look: [0.4, 2.8, -2.5], fov: 56 },
];
const roll = (i: number, t: number) => 1 - Easing.out(Easing.cubic)(clamp((t - 0.1 - i * 0.35) / 2.1));
const S1 = ({ t, f }: Ctx) => {
  const lift = seg(t, 3.77, 4.4, Easing.out(Easing.back(1.6))), toRing = seg(t, 4.7, 5.2, Easing.inOut(Easing.sin)), a = Math.max(0, t - 4.94) * 2.6;
  const fan = seg(t, 4.9, 5.2, Easing.out(Easing.back(2)));
  return (<>
    <Cam t={t} keys={K1} />
    <SoviYard t={t} />
    {TP.map((p, i) => { const off = roll(i, t) * 11, P: V3 = [p[0] - off * Math.cos(TROT[i]), 0, p[2] + off * Math.sin(TROT[i])];
      return <T34 key={i} p={P} rotY={TROT[i]} spin={-off / 0.4} num={TNUM[i]} smoke={1} t={t + i} noTurret={t > 3.77} wheelsOff={t > 3.77 ? 2 : 0} turretYaw={0.4 - i * 0.3} />; })}
    {t > 3.77 ? Array.from({ length: 9 }, (_, k) => { const h = homeP(k), up: V3 = [h[0], h[1] + 2.4 * lift, h[2]], r = ringP(k, a), P: V3 = [lerp(up[0], r[0], toRing), lerp(up[1], r[1], toRing), lerp(up[2], r[2], toRing)];
      return k < 3 ? <Turret key={k} p={P} yaw={TROT[k] + t * 1.5 * toRing} num={TNUM[k]} tilt={Math.sin(t * 3 + k) * 0.15 * lift} /> : <Wheel key={k} p={P} rot={t * 4 + k} />; }) : null}
    {t > 3.77 && t < 4.3 ? TP.map((p, i) => <Glow key={i} p={[p[0], 2.2, p[2]]} r={1.8} color="rgba(255,240,200,1)" o={0.6 * (1 - seg(t, 3.77, 4.3))} />) : null}
    <Person p={[0.4, 0, 3.0]} h={3.0} look={ivan} f={f} pose={{ mood: t < 3.2 ? "deadpan" : t < 4.9 ? "smile" : "grin", arms: t > 3.6 && t < 4.9 ? "up" : undefined, armK: 1,
      armR: t >= 4.9 ? [0.3, 0.5 + 0.06 * Math.sin(t * 9)] : undefined, armRK: fan, armL: t >= 4.9 ? [-0.18, 0.46] : undefined, armLK: fan, lookX: t < 3.2 ? -1 : 0, squash: t > 3.7 && t < 3.9 ? -0.08 : 0 }} />
    {fan > 0.05 ? <FaceGroup p={[0.4, 0, 3.0]}>{[0, 1, 2, 3, 4].map((i) => { const hp = hand(3.0, [0.3, 0.5 + 0.06 * Math.sin(t * 9)], 0, false, 0.15); return <CanvasPlane key={i} p={[hp[0] + (i - 2) * 0.12 * fan, hp[1] + 0.25 + Math.abs(i - 2) * -0.04, hp[2] + i * 0.01]} rot={[0, 0, (i - 2) * -0.25 * fan]} s={[0.36, 0.52]} px={[72, 104]} draw={(c, W, H) => { c.fillStyle = "#fffdf6"; c.fillRect(0, 0, W, H); c.strokeStyle = INK; c.lineWidth = 6; c.strokeRect(3, 3, W - 6, H - 6); c.fillStyle = i % 2 ? "#e5233a" : "#111"; c.font = "900 48px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(i % 2 ? "♥" : "♠", W / 2, H / 2 + 4); }} />; })}</FaceGroup> : null}
  </>);
};

/* =================== S2 7.1 – 13.2  German garage: one perfect Tiger, polished for months =================== */
const K2: Key[] = [
  { t: 7.0, pos: [-7.5, 3.2, 9.5], look: [-4.0, 1.6, 0], fov: 56 }, { t: 8.6, pos: [-1.5, 3.4, 10.5], look: [0.2, 2.0, -1], fov: 54 },
  { t: 10.6, pos: [1.6, 3.0, 8.4], look: [1.2, 2.0, -1], fov: 52 }, { t: 12.0, pos: [3.4, 3.0, 8.6], look: [3.4, 2.4, -1], fov: 52 }, { t: 13.4, pos: [3.8, 3.0, 8.2], look: [3.8, 2.6, -1], fov: 50 },
];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const GerYard: React.FC<{ t: number; wall?: boolean }> = ({ t }) => (<>
  <Lights warm="#fff6e6" />{cobble()}<Sky t={t} />
  <Garage p={[0, 0, -2.6]} w={9} h={6} d={7} />
  <Gantry p={[0, 0, -2.2]} w={7.4} h={5.6} hookY={3.2} />
  <Fence p={[-6.4, 0, 0]} L={14} rotY={Math.PI / 2} />
  <BrickFactory p={[-10, 0, -14]} w={10} h={5} d={4} teeth={3} />
  {[9, 12].map((x, i) => <Tree key={i} p={[x, 0, -6 - i * 2]} s={1.2} t={t} />)}
  {[[5.4, -4.6], [5.9, -3.8], [6.4, -4.8]].map(([x, z], i) => <Cyl key={i} p={[x, 0.2 + i * 0.0, z]} rt={0.5} h={0.35} color="#2a2a2a" />)}
  <Box p={[-4.4, 0.4, -5.2]} s={[1.4, 0.8, 1.0]} color="#5d666e" /><Cyl p={[4.8, 0.55, 1.4]} rt={0.4} h={1.1} color="#3a3f46" />
</>);
const S2 = ({ t, f }: Ctx) => {
  const pol = t > 8.2, months = seg(t, 11.15, 12.75, Easing.linear), sparkle = seg(t, 10.1, 10.4);
  const cx = Math.cos(t * 7), cy = Math.sin(t * 7);
  return (<>
    <Cam t={t} keys={K2} />
    <GerYard t={t} />
    <Tiger p={[0, 0, -1.8]} color="#8f9592" t={t} />
    {sparkle > 0 ? [[-1.2, 2.2, -0.6], [1.8, 1.6, -0.6], [0.4, 3.1, -0.6], [2.6, 2.6, -0.6]].map((p, i) => { const tw = Math.max(0, Math.sin(t * 6 + i * 1.7)); return <Glow key={i} p={p as V3} r={0.7 * tw * sparkle + 0.01} color="rgba(255,255,255,1)" o={0.95} />; }) : null}
    <Person p={[2.7, 0, 0.6]} h={3.0} look={hans} f={f} pose={{ mood: t < 10.1 ? "smile" : "grin", flip: true, armR: pol ? [0.36 + 0.06 * cx, 0.48 + 0.06 * cy] : undefined, armRK: seg(t, 8.2, 8.5), lookX: -1, tilt: pol ? 0.04 * cx : 0 }} />
    {pol ? <FaceGroup p={[2.7, 0, 0.6]}><Box p={hand(3.0, [0.36 + 0.06 * cx, 0.48 + 0.06 * cy], 0, true, 0.14)} s={[0.34, 0.24, 0.05]} color="#ffffff" line={2} /></FaceGroup> : null}
    {/* desk: clock + calendar racing through months */}
    <Desk p={[5.2, 0, -0.6]} w={2.6} top="#c49a64" leg="#7a5a32" /><Clock p={[5.2, 3.3, -1.1]} r={0.55} t={t} speed={months > 0 ? 60 : 1} />
    <Calendar p={[6.3, 2.5, -1.0]} month={MONTHS[Math.min(11, Math.floor(months * 9))]} day="1" s={1.0} />
  </>);
};

/* =================== S3 13.2 – 18.3  one week, parts slam back, three tanks drive away =================== */
const K3: Key[] = [
  { t: 13.1, pos: [-5.5, 2.2, 7.0], look: [-6.6, 2.3, -4], fov: 52 }, { t: 14.6, pos: [-2.2, 4.6, 11.5], look: [0.2, 2.4, -2.5], fov: 56 },
  { t: 16.5, pos: [1.0, 4.4, 12.0], look: [0.6, 1.8, -2.5], fov: 58 }, { t: 18.5, pos: [4.0, 3.8, 11.5], look: [3.0, 1.6, -2.5], fov: 56 },
];
const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const S3 = ({ t, f }: Ctx) => {
  const wk = seg(t, 13.3, 14.4, Easing.linear), a = (t - 4.94) * 2.6;
  const drive = (i: number) => Math.max(0, t - 16.65 - i * 0.15), dd = (i: number) => 1.6 * drive(i) * drive(i) * 0.5 + 0.8 * drive(i);
  const back = (k: number) => seg(t, 14.7 + (k % 3) * 0.18 + (k > 2 ? 0.5 : 0), 15.1 + (k % 3) * 0.18 + (k > 2 ? 0.5 : 0), Easing.in(Easing.quad));
  const shuffled = [2, 0, 1]; // turret k lands on tank shuffled[k]
  return (<>
    <Cam t={t} keys={K3} impacts={[[15.1, 0.03], [15.3, 0.03], [15.5, 0.03]]} />
    <SoviYard t={t} />
    <Calendar p={[-6.6, 2.4, -8.2]} month="WEEK" day={DAYS[Math.min(6, Math.floor(wk * 7))]} s={1.5} />
    {TP.map((p, i) => { const k = shuffled.indexOf(i), on = back(k) >= 1, d = dd(i), P: V3 = [p[0] + d * Math.cos(-0.35), 0, p[2] + d * Math.sin(0.35)];
      return <T34 key={i} p={P} rotY={lerp(TROT[i], -0.35, seg(t, 16.4, 16.9))} spin={d / 0.4} num={TNUM[k]} noTurret={!on} wheelsOff={t > 15.75 ? 0 : 2} smoke={0} turretYaw={0} />; })}
    {Array.from({ length: 9 }, (_, k) => { const b = back(k); if (b >= 1) return null; const r = ringP(k, a);
      const tgt: V3 = k < 3 ? [TP[shuffled[k]][0] - 0.25, 1.5, TP[shuffled[k]][2]] : homeP(k);
      const P: V3 = [lerp(r[0], tgt[0], b), lerp(r[1], tgt[1], b) + Math.sin(b * Math.PI) * 0.8, lerp(r[2], tgt[2], b)];
      return k < 3 ? <Turret key={k} p={P} yaw={lerp(TROT[k] + a, TROT[shuffled[k]], b)} num={TNUM[k]} /> : <Wheel key={k} p={P} rot={t * 4 + k} />; })}
    {[0, 1, 2].map((k) => <Spark key={k} p={[TP[shuffled[k]][0], 1.6, TP[shuffled[k]][2] + 0.8]} t={t} t0={15.1 + k * 0.18} />)}
    {t > 16.7 ? [0, 1, 2].map((i) => { const d = dd(i), P = TP[i]; return [0, 1].map((q) => { const u = ((t * 1.5 + q * 0.5 + i) % 1); return <Glow key={i + "-" + q} p={[P[0] + d * 0.94 - 2.8 - u, 1.3 + u * 0.8, P[2] - d * 0.34 + 0.4]} r={0.5 + u * 0.8} color="rgba(80,80,80,1)" o={0.5 * (1 - u)} />; }); }) : null}
    <Person p={[0.4, 0, 3.0]} h={3.0} look={ivan} f={f} pose={{ mood: t < 16.5 ? "smile" : "laugh", arms: t > 16.6 ? "up" : undefined, armK: 0.7 + 0.3 * Math.sin(t * 8), armR: t > 14.6 && t < 16.4 ? [0.34, 0.5 + 0.12 * Math.sin(t * 14)] : undefined, armRK: 1, lookX: 1 }} />
    {t > 14.6 && t < 16.4 ? <FaceGroup p={[0.4, 0, 3.0]}><Wrench p={hand(3.0, [0.34, 0.5 + 0.12 * Math.sin(t * 14)], 0, false, 0.15)} rot={-0.6 + Math.sin(t * 14) * 0.5} /></FaceGroup> : null}
    {/* the German peeks over the fence */}
    <Person p={[9.4, 0, -2.6]} h={3.0} look={hans} f={f} pose={{ mood: t > 16.8 ? "shock" : "deadpan", arms: "chest", armK: 1, flip: true, lookX: -1 }} />
  </>);
};

/* =================== S4 18.3 – 21.55  1942: the Tiger bursts through the garage wall =================== */
const K4: Key[] = [{ t: 18.2, pos: [3.2, 1.4, 12.5], look: [0, 3.0, 0], fov: 56 }, { t: 20.3, pos: [2.0, 1.2, 10.8], look: [0, 2.6, 0], fov: 54 }, { t: 21.7, pos: [1.6, 1.0, 11.6], look: [0, 2.0, 2], fov: 58 }];
const TI = 20.62;
const S4 = ({ t, f }: Ctx) => {
  const z = t < TI ? -6.8 - (TI - t) * 6 : -6.8 + 10.5 * (1 - Math.exp(-(t - TI) * 1.1)), spin = (z + 12) / 0.46, d = Math.max(0, t - TI);
  const sign = seg(t, 18.6, 19.0, Easing.out(Easing.back(2.2)));
  return (<>
    <Cam t={t} keys={K4} impacts={[[TI, 0.07]]} />
    <Lights warm="#ffc38a" />{cobble()}<Sky t={t} n={4} y={12} />
    <Glow p={[-8, 5, -30]} r={10} color="rgba(255,150,80,1)" o={0.45} />
    <Box p={[-6.3, 3.25, -0.9]} s={[5.4, 6.5, 0.45]} color="#e4e7ea" /><Box p={[6.3, 3.25, -0.9]} s={[5.4, 6.5, 0.45]} color="#e4e7ea" /><Box p={[0, 5.75, -0.9]} s={[7.2, 1.5, 0.45]} color="#e4e7ea" /><Box p={[0, 6.6, -4]} s={[17.6, 0.3, 6.6]} color="#58606a" />
    {/* wall in bricks: blown outward on impact */}
    {Array.from({ length: 6 * 5 }, (_, i) => { const cx = (i % 6) - 2.5, cy = Math.floor(i / 6), v: V3 = [cx * 1.2 + (rnd(i) - 0.5) * 2, 3 + rnd(i + 9) * 4, 5 + rnd(i + 4) * 5], g = 14;
      const tl = (v[1] + Math.sqrt(v[1] * v[1] + 2 * g * (cy + 0.5))) / g, q = Math.min(d, tl);
      const P: V3 = d > 0 ? [cx * 1.2 + v[0] * q, Math.max(0.3, cy * 1.0 + 0.5 + v[1] * q - 0.5 * g * q * q), -0.9 + v[2] * q] : [cx * 1.2, cy * 1.0 + 0.5, -0.9];
      return <Box key={i} p={P} s={[1.15, 0.95, 0.4]} rot={d > 0 ? [Math.min(d, tl) * 6 + i, Math.min(d, tl) * 4, 0] : [0, 0, 0]} color={i % 3 ? "#eef0f2" : "#dfe2e6"} line={2} />; })}
    {t < TI + 0.3 ? <CanvasPlane p={[0, 3.2, -0.66]} s={[4.2 * sign + 0.01, 2.0 * sign + 0.01]} px={[420, 200]} draw={(c, W, H) => { c.clearRect(0, 0, W, H); c.fillStyle = "#c8302f"; c.font = "900 170px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("1942", W / 2, H / 2 + 8); }} /> : null}
    {d > 0 && d < 0.6 ? <Glow p={[0, 2.5, 0]} r={5} color="rgba(255,240,210,1)" o={0.8 * (1 - d / 0.6)} /> : null}
    <Dust t={t} area={[8, 4, 6]} color="rgba(255,230,200,.8)" />
    <Tiger p={[0, 0, z]} rotY={-Math.PI / 2} color="#c4a35c" spin={spin} t={t} />
    {[-6.5, 6.5].map((x) => <Tree key={x} p={[x, 0, -4]} s={1.3} t={t} />)}
    <Person p={[-4.2, 0, 3.6]} h={3.0} look={hans} f={f} pose={{ mood: t > TI ? "grin" : "smile", arms: t > TI ? "up" : "chest", armK: 1, lookX: 1 }} />
  </>);
};

/* =================== S5 21.55 – 29.0  the wheat road: one-mile shot, shells bounce, kill rings =================== */
const FAR: V3 = [0, 0, -46];
const K5: Key[] = [
  { t: 21.4, pos: [3.2, 4.6, 12.0], look: [0, 1.6, -14], fov: 54 }, { t: 23.0, pos: [4.0, 8.0, 10.0], look: [0.5, 0.5, -22], fov: 54 },
  { t: 24.4, pos: [4.5, 5.5, 8.0], look: [0.6, 1.6, -14], fov: 54 }, { t: 25.2, pos: [6.5, 3.2, -8.5], look: [1.2, 1.8, -2], fov: 54 },
  { t: 27.0, pos: [6.8, 3.4, -6.8], look: [1.6, 2.4, -1.4], fov: 52 }, { t: 29.2, pos: [6.4, 3.4, -6.0], look: [1.6, 2.4, -1.2], fov: 50 },
];
const shotK = (t: number, t0: number, dur: number) => clamp((t - t0) / dur);
const S5 = ({ t, f }: Ctx) => {
  const fire = shotK(t, 22.2, 0.35), tape = seg(t, 22.8, 23.9, Easing.inOut(Easing.cubic)), rings = t < 27.18 ? 0 : t < 27.7 ? 1 : t < 28.2 ? 2 : t < 28.65 ? 3 : 4;
  const muzzle: V3 = [1.2, 2.45, -6.2], s1 = shotK(t, 24.62, 0.7), s2 = shotK(t, 25.05, 0.7);
  const shell = (k: number, b: number, t0: number) => { if (k <= 0) return null; if (k < 1) return <Ball p={[lerp(FAR[0] + 0.3, 1.2 + b, k), lerp(1.9, 1.6, k) + Math.sin(k * Math.PI) * 1.2, lerp(FAR[2] + 3, -2.0, k)]} r={0.16} color="#ffe27a" ink={0.03} />;
    const d = t - (t0 + 0.7); if (d > 0.7) return null; return <><Ball p={[1.2 + b + 3.5 * d, 1.6 + 7 * d - 9 * d * d, -2.0 - 3 * d]} r={0.16} color="#ffe27a" ink={0.03} /><CanvasPlane p={[1.2 + b, 1.7, -2.2]} s={[2.4 * (0.4 + d * 2), 2.4 * (0.4 + d * 2)]} px={[128, 128]} face additive draw={(c, W, H) => { c.clearRect(0, 0, W, H); c.strokeStyle = `rgba(255,255,255,${1 - d / 0.7})`; c.lineWidth = 8; c.beginPath(); c.arc(W / 2, H / 2, W * 0.4, 0, 7); c.stroke(); }} /></>; };
  return (<>
    <Cam t={t} keys={K5} impacts={[[22.2, 0.03], [25.32, 0.04], [25.75, 0.04]]} />
    <Lights warm="#fff2d0" /><Sky t={t} n={6} y={16} z={-80} />
    <Floor kind="tile" a="#e8b832" b="#deae2a" unit={1.4} w={160} d={200} />
    <Surface p={[0, 0.02, -40]} s={[4.6, 140]} rot={[-Math.PI / 2, 0, 0]} kind="plain" a="#b88a58" b="#b88a58" unit={2} />
    {[-2.8, 2.8].map((x) => <Surface key={x} p={[x, 0.025, -40]} s={[1.0, 140]} rot={[-Math.PI / 2, 0, 0]} kind="plain" a="#5aa83a" b="#5aa83a" unit={2} />)}
    {Array.from({ length: 9 }, (_, i) => <PowerPole key={i} p={[-4.2, 0, 8 - i * 11]} />)}
    {Array.from({ length: 8 }, (_, i) => <Tree key={i} p={[(i % 2 ? 1 : -1) * (14 + rnd(i) * 10), 0, -30 - i * 9]} s={1.6} t={t} />)}
    <Tiger p={[1.2, 0, 1.2]} rotY={Math.PI / 2} color="#c4a35c" rings={rings} t={t} />
    <T34 p={FAR} rotY={-Math.PI / 2} t={t} smoke={t > 22.55 ? 0.8 : 0} num="9" />
    {/* Tiger shot (1 mile) */}
    {fire > 0 && fire < 1 ? <Ball p={[lerp(muzzle[0], FAR[0], fire), lerp(muzzle[1], 1.9, fire), lerp(muzzle[2], FAR[2] + 2, fire)]} r={0.18} color="#fff3b0" ink={0.02} /> : null}
    {t > 22.2 && t < 22.5 ? <Glow p={muzzle} r={2.2} color="rgba(255,220,120,1)" o={0.9 * (1 - (t - 22.2) / 0.3)} /> : null}
    {t > 22.55 && t < 23.2 ? <Glow p={[FAR[0], 2, FAR[2] + 2]} r={4} color="rgba(255,170,60,1)" o={0.9 * (1 - (t - 22.55) / 0.65)} /> : null}
    {t < 24.9 ? <TapeMeasure a={[2.6, 0, -4.8]} b={[2.0, 0, FAR[2] + 3]} k={tape} label="1 MILE" /> : null}
    {/* T-34 shells bounce off */}
    {t > 24.6 && t < 24.8 ? <Glow p={[FAR[0], 2.2, FAR[2] + 3]} r={2.5} color="rgba(255,220,120,1)" o={0.8} /> : null}
    {t > 25.03 && t < 25.2 ? <Glow p={[FAR[0], 2.2, FAR[2] + 3]} r={2.5} color="rgba(255,220,120,1)" o={0.8} /> : null}
    {shell(s1, -0.4, 24.62)}{shell(s2, 0.5, 25.05)}
    {/* officer on the deck: laughs, then paints a ring per kill */}
    <Person p={[2.5, 1.92, -1.0]} sy={1.92} h={2.8} look={hans} f={f} pose={{ mood: t < 25.3 ? "smile" : "laugh", arms: t > 25.4 && t < 26.4 ? "up" : undefined, armK: 1,
      armR: t >= 26.6 ? [-0.4, 0.3 + 0.05 * Math.sin(t * 16)] : undefined, armRK: seg(t, 26.6, 26.9), flip: true, lookX: -1 }} />
    {t >= 26.6 ? <FaceGroup p={[2.5, 1.92, -1.0]}><Box p={hand(2.8, [-0.4, 0.3 + 0.05 * Math.sin(t * 16)], 0, true, 0.15)} s={[0.08, 0.5, 0.08]} rot={[0, 0, 0.7]} color="#8a5a32" line={1} /></FaceGroup> : null}
  </>);
};

/* =================== S6 29.0 – 35.2  autumn rain: the road turns to mud, the Tiger sinks =================== */
const K6: Key[] = [{ t: 28.9, pos: [-3.4, 4.2, 13.0], look: [0, 1.4, -6], fov: 56 }, { t: 31.8, pos: [-1.2, 3.8, 12.0], look: [-0.6, 1.4, -6], fov: 54 }, { t: 33.5, pos: [2.8, 3.2, 10.6], look: [2.6, 1.4, 0], fov: 52 }, { t: 35.4, pos: [3.4, 2.6, 9.4], look: [2.6, 1.0, 0.5], fov: 52 }];
const S6 = ({ t, f }: Ctx) => {
  const sink = 0.85 * Easing.inOut(Easing.cubic)(seg(t, 33.6, 34.9, Easing.linear)), crawl = (i: number) => lerp(-30 + i * 6, -10 + i * 4, clamp((t - 30.5) / 4.6));
  return (<>
    <Cam t={t} keys={K6} />
    <ambientLight intensity={1.3} /><directionalLight position={[3, 8, 4]} intensity={0.8} color="#d8e2ee" />
    <Floor kind="tile" a="#6d7a3a" b="#647036" unit={2.2} w={120} d={160} />
    <Surface p={[0, 0.02, -30]} s={[8, 120]} rot={[-Math.PI / 2, 0, 0]} kind="plain" a="#5a3a1e" b="#5a3a1e" unit={2} />
    {Array.from({ length: 8 }, (_, i) => <CanvasPlane key={i} p={[(rnd(i) - 0.5) * 6, 0.04, 2 - i * 5]} rot={[-Math.PI / 2, 0, 0]} s={[1.6 + rnd(i + 2), 0.8]} px={[64, 32]} draw={(c, W, H) => { c.clearRect(0, 0, W, H); c.fillStyle = "rgba(150,170,190,.85)"; c.beginPath(); c.ellipse(W / 2, H / 2, W * 0.46, H * 0.4, 0, 0, 7); c.fill(); }} />)}
    {Array.from({ length: 10 }, (_, i) => <Tree key={i} p={[(i % 2 ? 1 : -1) * (7 + rnd(i) * 6), 0, 2 - i * 6]} s={1.4} color={["#e07a1e", "#d9a420", "#c4502a"][i % 3]} t={t} />)}
    {Array.from({ length: 5 }, (_, i) => <PowerPole key={i} p={[-5, 0, 6 - i * 12]} />)}
    {[0, 1].map((i) => <T34 key={i} p={[-1.6 + i * 0.4, 0, crawl(i)]} rotY={-Math.PI / 2} spin={crawl(i) / 0.4} num={String(20 + i)} sink={0.15} t={t} />)}
    <Glow p={[-12, 3, -40]} r={6} color="rgba(255,120,40,1)" o={0.4 + 0.1 * Math.sin(t * 9)} />
    <Tiger p={[2.6, 0, 1.0]} rotY={-Math.PI / 2 - 0.2} color="#b29355" sink={sink} mud={0.6 + sink * 0.4} t={t} />
    {sink > 0.02 && sink < 0.84 ? [0, 1, 2, 3, 4].map((i) => { const u = ((t * 2 + i / 5) % 1); return <Ball key={i} p={[2.6 + (i - 2) * 0.9, 0.2 + Math.sin(u * Math.PI) * 1.1, 1.0 + 1.9 * (i % 2 ? 1 : -1) * (0.6 + u * 0.4)]} r={0.14} color="#4a2e16" ink={0.02} />; }) : null}
    <Person p={[2.4, 1.92 - sink, 2.2]} sy={1.92 - sink} h={2.8} look={hans} f={f} pose={{ mood: t < 33.6 ? "deadpan" : "worry", sweat: t > 33.6 ? 1 : 0, nerv: t > 34 ? 0.6 : 0, arms: t > 34 ? "head" : "chest", armK: 1, lookX: -0.5 }} />
    <Weather t={t} kind="rain" c={[1, 0, 3]} area={[16, 10, 12]} n={110} />
  </>);
};

/* =================== S7 35.2 – 40.6  winter: wheels freeze overnight, the gearbox cracks =================== */
const K7: Key[] = [{ t: 35.1, pos: [-4.0, 4.4, 12.5], look: [0, 1.6, 0], fov: 56 }, { t: 36.6, pos: [-1.8, 2.0, 9.0], look: [-0.4, 1.0, 0], fov: 52 }, { t: 38.6, pos: [0.6, 1.8, 8.6], look: [0.2, 1.0, 0], fov: 50 }, { t: 39.5, pos: [-7.0, 3.0, 8.4], look: [-2.8, 1.4, 0], fov: 54 }, { t: 40.8, pos: [-7.6, 3.2, 8.8], look: [-2.8, 1.6, 0], fov: 54 }];
const S7 = ({ t, f }: Ctx) => {
  const ice = seg(t, 36.6, 38.4, Easing.linear), night = Math.sin(clamp((t - 37.6) / 1.2) * Math.PI), crack = seg(t, 39.63, 40.2, Easing.out(Easing.cubic));
  return (<>
    <Cam t={t} keys={K7} impacts={[[40.16, 0.06]]} />
    <ambientLight intensity={1.5 - 0.8 * night} /><directionalLight position={[4, 8, 5]} intensity={1.0 - 0.6 * night} color="#eaf2ff" />
    {snowF()}
    <Box p={[0, 25, -60]} s={[200, 60, 1]} color={night > 0.5 ? "#2a3060" : "#b9c3e8"} line={1} />
    <Ball p={[lerp(-20, 20, clamp((t - 37.4) / 1.8)), 14 + Math.sin(clamp((t - 37.4) / 1.8) * Math.PI) * 6, -55]} r={2} color="#fff6d0" ink={0.1} />
    {Array.from({ length: 10 }, (_, i) => <Tree key={i} p={[(i % 2 ? 1 : -1) * (8 + rnd(i) * 10), 0, -6 - i * 4]} s={1.3} bare t={t} />)}
    {Array.from({ length: 4 }, (_, i) => <PowerPole key={i} p={[-7, 0, 4 - i * 12]} />)}
    <Tiger p={[0, 0, 0]} rotY={0} color="#c9c4b4" ice={ice} crack={crack} t={t} snow />
    {ice > 0.2 ? [0, 1, 2, 3, 4, 5].map((i) => { const tw = Math.max(0, Math.sin(t * 5 + i * 1.9)); return <Glow key={i} p={[-2.3 + i * 0.85, 0.5 + (i % 2) * 0.3, 1.9]} r={0.5 * tw * ice + 0.01} color="rgba(220,245,255,1)" o={0.9} />; }) : null}
    <Person p={[-4.4, 0, 2.6]} h={2.9} look={hans} f={f} pose={{ mood: t < 40.0 ? "worry" : "shock", sweat: t > 39.6 ? 1 : 0, nerv: 0.55, hunch: 0.5, arms: t > 40.0 ? "head" : "chest", armK: 1, squash: t > 40.0 && t < 40.2 ? -0.1 : 0, lookX: 1 }} />
    <Weather t={t} kind="snow" c={[0, 0, 2]} area={[16, 8, 10]} n={80} />
  </>);
};

/* =================== S8 40.6 – 44.95  fixing a Tiger = fixing a pocket watch; a month =================== */
const K8: Key[] = [{ t: 40.5, pos: [0.6, 3.4, 10.5], look: [0.6, 2.4, 0], fov: 54 }, { t: 42.6, pos: [1.6, 3.2, 8.4], look: [1.8, 2.6, 0], fov: 50 }, { t: 43.6, pos: [2.6, 3.2, 8.0], look: [3.2, 2.6, 0], fov: 50 }, { t: 45.1, pos: [3.4, 3.2, 7.6], look: [4.0, 2.6, 0], fov: 48 }];
const S8 = ({ t, f }: Ctx) => {
  const open = seg(t, 42.6, 43.1, Easing.out(Easing.back(1.4))), pop = seg(t, 41.0, 41.4, Easing.out(Easing.back(2))), days = seg(t, 43.7, 44.6, Easing.linear);
  return (<>
    <Cam t={t} keys={K8} />
    <Lights warm="#f2f4ff" />{snowF()}
    <Box p={[0, 25, -60]} s={[200, 60, 1]} color="#c9cfee" line={1} />
    <Tiger p={[-3.2, 0, -3.0]} color="#c9c4b4" t={t} snow crack={0.6} />
    {Array.from({ length: 6 }, (_, i) => <Tree key={i} p={[(i % 2 ? 1 : -1) * (9 + rnd(i) * 6), 0, -8 - i * 4]} s={1.3} bare t={t} />)}
    {[[-1, 0.2, 2], [0.2, 0.1, 2.4], [-0.4, 0.15, 1.4]].map(([x, y, z], i) => <Box key={i} p={[x, y, z]} s={[0.4, 0.2, 0.3]} color="#6a6f78" rot={[0, i, 0]} line={2} />)}
    <PocketWatch p={[1.6, 2.6, 0.2]} s={pop * 1.1 + 0.01} open={open} t={t * 3} rotY={-0.15} />
    <Glow p={[1.6, 2.6, 0.6]} r={2.6} color="rgba(255,220,120,1)" o={0.3 * pop} />
    <Person p={[-0.6, 0, 1.8]} h={2.9} look={hans} f={f} pose={{ mood: "worry", sweat: 1, nerv: 0.3, hunch: 0.7, armR: [0.34, 0.6], armRK: 1, lookX: 1 }} />
    <Box p={[4.4, 1.0, 0.4]} s={[0.12, 2.0, 0.12]} color="#5a3a1e" line={2} />
    <Calendar p={[4.4, 2.6, 0.5]} month={days > 0.5 ? "FEB" : "JAN"} day={String(1 + Math.floor(days * 29))} s={1.3} mark={days >= 1 ? "1 MONTH" : undefined} markK={seg(t, 44.6, 44.9)} />
    <Weather t={t} kind="snow" c={[0, 0, 1]} area={[14, 8, 8]} n={60} />
  </>);
};

/* =================== S9 44.95 – 48.15  the Soviet drops a broken engine and grabs another =================== */
const K9: Key[] = [{ t: 44.8, pos: [-3.0, 2.8, 9.4], look: [0, 1.8, 0], fov: 54 }, { t: 46.4, pos: [-0.8, 2.4, 8.2], look: [0.4, 1.4, 0], fov: 52 }, { t: 48.3, pos: [1.6, 2.6, 8.4], look: [1.2, 1.6, 0], fov: 52 }];
const S9 = ({ t, f }: Ctx) => {
  const rel = 45.84, d = Math.max(0, t - rel), tl = Math.sqrt(2 * 1.25 / 14), q = Math.min(d, tl), grab = seg(t, 47.34, 47.6), lift = seg(t, 47.6, 48.0, Easing.out(Easing.back(1.5)));
  const P: V3 = [0, 0, 1.2], h = 3.0, hy = t < rel ? 0.42 : grab > 0 ? lerp(0.3, 0.45, lift) : 0.45;
  return (<>
    <Cam t={t} keys={K9} impacts={[[rel + tl, 0.04]]} />
    <Lights warm="#f2f4ff" />{snowF()}
    <Box p={[0, 25, -60]} s={[200, 60, 1]} color="#c9cfee" line={1} />
    <T34 p={[-3.4, 0, -2.4]} rotY={0.4} num="5" snow t={t} />
    <BrickFactory p={[2, 0, -14]} w={18} h={5} d={4} teeth={4} />
    {Array.from({ length: 4 }, (_, i) => <Tree key={i} p={[-10 + i * 6.5, 0, -9 - (i % 2) * 2]} s={1.2} bare t={t} />)}
    {/* stack of fresh engines */}
    {[0, 1, 2].map((i) => i === 2 && t > 47.4 ? null : <EngineBlock key={i} p={[2.4, i * 0.82, 0.8]} rot={[0, 0.2, 0]} s={1} />)}
    {t > 47.4 ? <FaceGroup p={P}><EngineBlock p={[0.25 * h * 0.6, h * hy - 0.3, 0.2]} s={0.9} /></FaceGroup> : null}
    {t < rel ? <FaceGroup p={P}><EngineBlock p={[0, h * hy - 0.35, 0.2]} s={0.9} broken t={t} /></FaceGroup> : <EngineBlock p={[0.3, Math.max(0, 1.25 - 0.5 * 14 * q * q - 0.35) + 0, 1.5]} rot={[0, 0, d > tl ? 0.15 : d * 2]} s={0.9} broken t={t} />}
    {d > tl && d < tl + 0.5 ? <Glow p={[0.3, 0.3, 1.6]} r={1.6} color="rgba(255,255,255,1)" o={0.7 * (1 - (d - tl) / 0.5)} /> : null}
    <Person p={P} h={h} look={ivan} f={f} pose={{ mood: t < rel ? "deadpan" : t < 47.3 ? "smile" : "grin", armR: t < rel ? [0.22, hy] : grab > 0 ? [lerp(0.5, 0.25, lift), hy] : undefined, armRK: 1, armL: t < rel ? [-0.22, hy] : grab > 0 ? [lerp(0.2, 0.0, lift), hy] : undefined, armLK: 1, squash: t < rel ? -0.05 : grab > 0 && lift < 1 ? -0.06 : 0, lookX: t > 47 ? 1 : 0 }} />
    <Weather t={t} kind="snow" c={[0, 0, 1]} area={[14, 8, 8]} n={50} />
  </>);
};

/* =================== S10 48.15 – 53.85  1,300 Tigers vs 50,000 T-34s =================== */
const K10: Key[] = [{ t: 48.0, pos: [-7.5, 8, 13], look: [-6.5, -0.5, -6], fov: 54 }, { t: 50.4, pos: [-5.0, 9, 14], look: [-4.0, -0.5, -8], fov: 56 }, { t: 51.8, pos: [2.6, 10, 13], look: [3.0, -1.0, -12], fov: 56 }, { t: 54.0, pos: [3.0, 10.5, 14], look: [3.2, -1.0, -13], fov: 58 }];
const S10 = ({ t, f }: Ctx) => {
  const nT = seg(t, 49.25, 50.1, Easing.linear), nS = seg(t, 51.4, 52.8, Easing.out(Easing.quad));
  const big = Math.round(nS * 50000), small = Math.round(nT * 1300);
  return (<>
    <Cam t={t} keys={K10} />
    <Lights warm="#f2f4ff" />{snowF()}
    <Box p={[0, 25, -70]} s={[200, 60, 1]} color="#c9cfee" line={1} />
    {[0, 1, 2].map((i) => <Tiger key={i} p={[-8.4 + i * 1.6, 0, -1.5 + i * 1.6]} rotY={0.6} color="#c9c4b4" s={0.42} snow />)}
    <Counter p={[-7.2, 4.0, 0]} s={[4.4, 1.9]} text={small.toLocaleString("en-US")} sub="TIGERS" color="#5d666e" />
    {Array.from({ length: 8 * 6 }, (_, i) => { const r = Math.floor(i / 8), c = i % 8, appear = seg(t, 51.4 + (r + c) * 0.08, 51.7 + (r + c) * 0.08, Easing.out(Easing.back(2)));
      return appear > 0.01 ? <T34 key={i} p={[-1.8 + c * 2.0, 0, -9 + r * 2.0]} rotY={0.6} s={0.42 * appear} num="" snow /> : null; })}
    <Counter p={[5.2, 5.2, -4]} s={[5.6, 2.2]} text={big.toLocaleString("en-US")} sub="T-34s" color="#c8302f" />
    <Person p={[-4.4, 0, 2.8]} h={2.8} look={hans} f={f} pose={{ mood: t < 51.4 ? "smile" : "shock", arms: t > 51.6 ? "head" : "chest", armK: 1, lookX: 1, sweat: t > 51.6 ? 1 : 0 }} />
    <Weather t={t} kind="snow" c={[0, 0, 0]} area={[24, 10, 16]} n={60} />
  </>);
};

/* =================== S11 53.85 – 61.15  same underneath -> spare-parts shop: a wheel, a gun, a hammer =================== */
const K11: Key[] = [{ t: 53.7, pos: [0, 6.0, 19.0], look: [0, 1.4, 0], fov: 56 }, { t: 56.6, pos: [0, 6.5, 20.0], look: [0, 2.6, 0], fov: 56 }, { t: 58.2, pos: [-2.0, 4.5, 15.0], look: [-1.5, 1.4, 0], fov: 54 }, { t: 59.5, pos: [2.0, 4.5, 15.0], look: [1.5, 1.4, 0], fov: 54 }, { t: 61.3, pos: [0.6, 4.0, 13.0], look: [0.6, 1.4, 0], fov: 54 }];
const XS = [-4.2, 0, 4.2];
const S11 = ({ t, f }: Ctx) => {
  const lift = seg(t, 54.6, 55.1, Easing.out(Easing.back(1.4))) * (1 - seg(t, 56.0, 56.4, Easing.in(Easing.quad)));
  const shop = seg(t, 56.67, 57.2, Easing.out(Easing.back(1.8)));
  const wk = seg(t, 58.36, 59.0, Easing.inOut(Easing.sin)), gk = seg(t, 59.6, 60.25, Easing.inOut(Easing.sin)), ham = 60.72, hd = t - ham;
  const swing = t < ham - 0.35 ? 0 : t < ham ? seg(t, ham - 0.35, ham, Easing.in(Easing.quad)) : 1 - seg(t, ham + 0.2, ham + 0.5);
  return (<>
    <Cam t={t} keys={K11} impacts={[[ham, 0.05], [56.9, 0.02]]} />
    <Lights warm="#fff4e0" />{snowF()}
    <Box p={[0, 25, -60]} s={[200, 60, 1]} color="#d6d9f0" line={1} />
    <BrickFactory p={[0, 0, -12]} w={24} h={5.5} d={4} teeth={5} />
    {XS.map((x, i) => <React.Fragment key={i}>
      <EngineBlock p={[x, 0.95, -0.4]} rot={[0, Math.PI / 2, 0]} s={1.0} />
      <group position={[0, lift * 2.2, 0]}><T34 p={[x, 0, 0]} rotY={-Math.PI / 2} num={String(i + 1)} snow noBarrel={(i === 2 && gk > 0) || (i === 1 && gk < 1 && false)} wheelsOff={i === 0 && wk > 0 ? 1 : 0} /></group>
      {lift > 0.3 ? <Counter p={[x, 4.8 + lift * 0.4, 0.6]} s={[1.2, 1.0]} text="✓" color="#22a84a" /> : null}
    </React.Fragment>)}
    {/* flying wheel: tank 1 -> tank 2; flying gun: tank 3 -> tank 2 */}
    {wk > 0 && wk < 1 ? <Wheel p={[lerp(XS[0] + 1.5, XS[1] - 1.5, wk), 0.46 + Math.sin(wk * Math.PI) * 3, 1.0]} rot={t * 8} /> : null}
    {gk > 0 && gk < 1 ? <Cyl p={[lerp(XS[2], XS[1], gk), 1.88 + Math.sin(gk * Math.PI) * 3, 2.0]} rt={0.075} h={2.3} color="#4f7a3a" rot={[Math.PI / 2 + gk * Math.PI * 2, 0, 0]} line={2} /> : null}
    {/* spare parts sign + sparks */}
    <group position={[0, lerp(12, 6.4, shop), -1.4]}><Box p={[-2.6, 1.2, 0]} s={[0.05, 2.4, 0.05]} color="#8a8f99" line={1} /><Box p={[2.6, 1.2, 0]} s={[0.05, 2.4, 0.05]} color="#8a8f99" line={1} />
      <CanvasPlane p={[0, 0, 0]} s={[6.4, 1.5]} px={[640, 150]} frame="#2a1a12" draw={(c, W, H) => { c.fillStyle = "#c8302f"; c.fillRect(0, 0, W, H); c.fillStyle = "#ffd23a"; c.font = "900 92px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("SPARE PARTS", W / 2, H / 2 + 6); }} /></group>
    {shop > 0 ? [0, 1, 2, 3, 4].map((i) => <Spark key={i} p={[-6 + i * 3, 1.4 + (i % 2), 1.2]} t={t} t0={56.9 + i * 0.25 + Math.floor((t - 56.9) / 1.3) * 1.3} />) : null}
    <Spark p={[XS[1] + 1.2, 1.8, 1.6]} t={t} t0={ham} n={10} />
    <Person p={[XS[1] + 2.2, 0, 2.6]} h={3.0} look={ivan} f={f} pose={{ mood: t < ham ? "smile" : "laugh", armR: [lerp(0.2, 0.42, swing), lerp(0.95, 0.4, swing)], armRK: seg(t, 60.2, 60.4), flip: true, lookX: -1, squash: hd > 0 && hd < 0.15 ? -0.06 : 0 }} />
    {t > 60.2 ? <FaceGroup p={[XS[1] + 2.2, 0, 2.6]}><Hammer p={hand(3.0, [lerp(0.2, 0.42, swing), lerp(0.95, 0.4, swing)], 0, true, 0.15)} rot={lerp(0.4, 2.0, swing)} /></FaceGroup> : null}
    <Weather t={t} kind="snow" c={[0, 0, 2]} area={[20, 9, 12]} n={50} />
  </>);
};

/* =================== S12 61.15 – 64.5  finale: one perfect tank vs tanks you can fix =================== */
const K12: Key[] = [{ t: 61.0, pos: [-6.4, 3.2, 10.5], look: [-5.6, 2.0, 0], fov: 54 }, { t: 62.6, pos: [-4.0, 3.4, 11.5], look: [-3.0, 2.0, 0], fov: 56 }, { t: 64.0, pos: [3.0, 4.2, 14.5], look: [2.8, 2.0, -1], fov: 58 }, { t: 64.7, pos: [3.4, 4.4, 15.2], look: [3.0, 2.0, -1], fov: 58 }];
const S12 = ({ t, f }: Ctx) => {
  const col = (i: number) => -14 + i * 6.4 + Math.max(0, t - 62.2) * 3.2;
  return (<>
    <Cam t={t} keys={K12} />
    <Lights warm="#ffe9d0" />{snowF()}
    <Box p={[0, 25, -70]} s={[200, 60, 1]} color="#f3c9b0" line={1} />
    <Glow p={[10, 8, -60]} r={14} color="rgba(255,170,110,1)" o={0.5} />
    <Tiger p={[-6.6, 0, -2.2]} rotY={0.3} color="#c4a35c" rings={4} t={t} crack={0.4} snow />
    {[[-7.6, 2.6, -1.4], [-5.2, 3.0, -1.6]].map((p, i) => <Glow key={i} p={p as V3} r={0.5 * Math.max(0, Math.sin(t * 5 + i * 2)) + 0.01} color="rgba(255,255,255,1)" o={0.9} />)}
    <Person p={[-4.2, 0, 1.6]} h={2.9} look={hans} f={f} pose={{ mood: t < 62.8 ? "grin" : "worry", armR: t < 62.8 ? [0.34 + 0.05 * Math.cos(t * 7), 0.5 + 0.05 * Math.sin(t * 7)] : undefined, armRK: 1, lookX: t < 62.8 ? -1 : 1, flip: t < 62.8 }} />
    <Fence p={[-1.0, 0, -3.6]} L={4} rotY={Math.PI / 2} />
    {[0, 1, 2, 3].map((i) => <T34 key={i} p={[col(i), 0, -4.6]} rotY={0} spin={col(i) / 0.4} num={String(31 + i)} snow t={t} />)}
    <Person p={[3.0, 0, 1.6]} h={3.0} look={ivan} f={f} pose={{ mood: "laugh", arms: t > 62.8 ? "up" : "chest", armK: t > 62.8 ? 0.8 + 0.2 * Math.sin(t * 7) : 1, lookX: -1 }} />
    <Weather t={t} kind="snow" c={[0, 0, 1]} area={[22, 9, 12]} n={50} />
  </>);
};

const CUTS = [0, 7.1, 13.2, 18.3, 21.55, 29.0, 35.2, 40.6, 44.95, 48.15, 53.85, 61.15, 64.6];
export const TankParts: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("mix.wav")} />
      <Scene first start={CUTS[0]} end={CUTS[1]} bg="#8cc8f0">{(c) => <S1 {...c} />}</Scene>
      <Scene start={CUTS[1]} end={CUTS[2]} bg="#8cc8f0" trans="whip">{(c) => <S2 {...c} />}</Scene>
      <Scene start={CUTS[2]} end={CUTS[3]} bg="#8cc8f0" trans="whip">{(c) => <S3 {...c} />}</Scene>
      <Scene start={CUTS[3]} end={CUTS[4]} bg="#f4a878" trans="zoom">{(c) => <S4 {...c} />}</Scene>
      <Scene start={CUTS[4]} end={CUTS[5]} bg="#7cc4f2" trans="flash">{(c) => <S5 {...c} />}</Scene>
      <Scene start={CUTS[5]} end={CUTS[6]} bg="#8592a0">{(c) => <S6 {...c} />}</Scene>
      <Scene start={CUTS[6]} end={CUTS[7]} bg="#b9c3e8" trans="whip">{(c) => <S7 {...c} />}</Scene>
      <Scene start={CUTS[7]} end={CUTS[8]} bg="#c9cfee" trans="zoom">{(c) => <S8 {...c} />}</Scene>
      <Scene start={CUTS[8]} end={CUTS[9]} bg="#c9cfee" trans="whip">{(c) => <S9 {...c} />}</Scene>
      <Scene start={CUTS[9]} end={CUTS[10]} bg="#c9cfee">{(c) => <S10 {...c} />}</Scene>
      <Scene start={CUTS[10]} end={CUTS[11]} bg="#d6d9f0" trans="whip">{(c) => <S11 {...c} />}</Scene>
      <Scene start={CUTS[11]} end={CUTS[12]} bg="#f3c9b0">{(c) => <S12 {...c} />}</Scene>
      <Grade t={t} shaft={false} tint={t < 21.55 ? "rgba(255,220,150,.04)" : t < 29 ? "rgba(255,230,120,.05)" : t < 35.2 ? "rgba(60,80,110,.12)" : "rgba(120,120,220,.08)"} />
      <Captions />
    </AbsoluteFill>
  );
};
void camAt; void Shaft; void Gantry;
