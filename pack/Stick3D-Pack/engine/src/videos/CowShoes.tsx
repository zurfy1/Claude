// "How moonshiners hid their footprints" — 9:16 720x1280 30fps, 32.6 s. Original script, stick-in-3D style.
// Structure mirrors the reference spy short: unexplained object close-up on a teal studio -> attach -> character reveal ("shh")
// -> mission location -> how it works (glowing highlight) -> tension (agent passes) -> payoff -> loop back to the object.
// S1 hoof shoe close-up, nails, strapped on, moonshiner reveal | S2 still in the woods, ILLEGAL, crane-up reveal
// S3 agent follows boot prints to the still | S4 hoof shoes leave cow prints | S5 agent sees cattle tracks, walks by
// S6 1922 Florida official shows off a pair to the press | S7 the idea: a Sherlock Holmes story (loops to the shoe)
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, Easing, Audio, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Box, Cyl, CanvasPlane, INK } from "../style/toon";
import { Look } from "../style/puppet";
import { Person, Lights, Grade, Desk, seg, lerp, clamp, V3 } from "../style/kit";
import { Floor, Glow, Dust, Shaft, Plant, Frame, WallDoor, Lamp } from "../style/props";
import { Cam, Key, FaceGroup, hand, Arrow3D, PressCam } from "../style/extra";
import { Tree, Counter, Fence } from "../style/tanks";
import { Palm, Crate } from "../style/egypt";
import { Magnifier, Stamp, Qmark } from "../style/greece";
import { CowShoe, Still, Jug, Barrel, Print, Book, Studio } from "../style/moonshine";
import { Captions } from "../Main";

const FPS = 30, LEAD = 6, TAIL = 8, WALK = 3.4;
type Ctx = { t: number; f: number };
type Trans = "ghost" | "zoom" | "flash" | "whip";

const shiner: Look = { skin: "#fbf3ea", body: "#c8432f", outfit: "shirt", overalls: "#3f6aa8", hair: "short", hairColor: "#5a3418", shoe: "#4a2a18", cap: "brim", capColor: "#8a6a3e", hooves: 1 };
const noHoof: Look = { ...shiner, hooves: 0 };
const agent: Look = { skin: "#fbf3ea", body: "#3a4560", outfit: "suit", tie: "#c8302f", shirt: "#f4f4f4", hair: "short", hairColor: "#1b1b2a", shoe: "#1b1b2a", cap: "brim", capColor: "#3a3a46", badge: "#ffd24a" };
const official: Look = { skin: "#fbf3ea", body: "#e9e2cf", outfit: "suit", tie: "#2f6a8f", shirt: "#ffffff", hair: "grey", shoe: "#5a3420", mustache: "#8a8a92", glasses: true, badge: "#ffd24a" };
const press: Look[] = [
  { skin: "#fbf3ea", body: "#6a5a4a", outfit: "blazer", shirt: "#f4f4f4", hair: "short", hairColor: "#2a1a12", shoe: "#2a2a2a", cap: "brim", capColor: "#5a4a3a" },
  { skin: "#fbf3ea", body: "#4a5a6a", outfit: "blazer", shirt: "#f4f4f4", hair: "bob", hairColor: "#7a3a1a", shoe: "#2a2a2a" },
];

/* ---------- scene wrapper (same as previous videos) ---------- */
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
const dirt = (a = "#7a5a3a", b = "#715234") => <Floor kind="tile" a={a} b={b} unit={2.4} w={140} d={140} />;
/* a forest: rings of trees around a clearing, skipping a corridor toward the camera */
const Woods: React.FC<{ t: number; n?: number; r0?: number; c?: V3; keepZ?: number; dark?: boolean }> = ({ t, n = 26, r0 = 7, c = [0, 0, 0], keepZ = 99, dark }) => (<>{Array.from({ length: n }, (_, i) => {
  const a = rnd(i) * Math.PI * 2, r = r0 + rnd(i + 9) * 14, x = c[0] + Math.cos(a) * r, z = c[2] + Math.sin(a) * r;
  if (z > keepZ && Math.abs(x - c[0]) < 6) return null;
  return <Tree key={i} p={[x, 0, z]} s={1.4 + rnd(i + 4) * 1.0} t={t} color={dark ? (i % 2 ? "#2f6a3a" : "#3a7a3a") : (i % 2 ? "#3f8a3a" : "#4f9a3a")} />;
})}</>);
const Path: React.FC<{ z0: number; z1: number; x?: number; w?: number }> = ({ z0, z1, x = 0, w = 2.2 }) => <Box p={[x, 0.005, (z0 + z1) / 2]} s={[w, 0.01, Math.abs(z1 - z0)]} color="#a07a4e" line={0.001} />;

/* =================== S1 0 – 5.15  close-up of a strange object: the hoof shoe. nailed, strapped, moonshiner reveal ("shh") =================== */
const K1: Key[] = [
  { t: 0, pos: [1.0, 0.95, 4.6], look: [0, 0.45, 1.6], fov: 40 },
  { t: 2.9, pos: [0.5, 0.9, 4.4], look: [0, 0.45, 1.6], fov: 38 },
  { t: 3.7, pos: [0.6, 0.9, 4.6], look: [0.2, 0.55, 0.4], fov: 44 },
  { t: 4.3, pos: [0.2, 2.3, 8.6], look: [0, 2.0, 0], fov: 50 },
  { t: 5.3, pos: [0.0, 2.2, 7.6], look: [0, 2.0, 0], fov: 50 },
];
const S1 = ({ t, f }: Ctx) => {
  const nails = seg(t, 1.7, 2.6, (x) => x), drop = seg(t, 3.36, 3.7, Easing.in(Easing.quad)), on = seg(t, 3.6, 3.85, Easing.out(Easing.back(2.5)));
  const shh = seg(t, 4.0, 4.3, Easing.out(Easing.back(1.8)));
  // hops in from the right and lands on the hooves (parabola, landing squash)
  const jump = seg(t, 3.2, 3.6, (x) => x), px = lerp(3.2, 0, jump), py = Math.sin(jump * Math.PI) * 1.4, land = t > 3.6 && t < 3.9 ? -0.18 * Math.sin(((t - 3.6) / 0.3) * Math.PI) : 0;
  const sp: V3 = [lerp(0, 0.4, drop), lerp(0.55 + Math.sin(t * 2) * 0.04, 0.1, drop), lerp(1.6, 0.4, drop)];
  return (<>
    <Cam t={t} keys={K1} />
    <ambientLight intensity={1.45} /><directionalLight position={[3, 8, 6]} intensity={1.25} color="#fff4e0" /><directionalLight position={[-5, 3, 2]} intensity={0.5} color="#9ad8ff" />
    <Studio />
    {t > 3.1 ? <Person p={[px, py, 0]} sy={0} h={3.4} look={{ ...shiner, hooves: on }} f={f} pose={{ air: jump > 0 && jump < 1 ? 1 : 0, squash: land,  mood: t < 4.0 ? "deadpan" : "grin", armR: [0.03, 0.52], armRK: shh, armL: [-0.26, 0.34], armLK: 1, lookX: t < 4.0 ? -0.6 : 0, tilt: shh * 0.04 + (jump < 1 ? -0.12 : 0), flip: jump < 1 }} /> : null}
    {t > 3.1 ? <FaceGroup p={[px, py, 0]}><Jug p={[hand(3.4, [-0.26, 0.34], 0, jump < 1)[0], hand(3.4, [-0.26, 0.34])[1] - 0.75, 0.1]} s={0.9} /></FaceGroup> : null}
    {t < 3.75 ? <CowShoe p={sp} s={lerp(1, 0.5, drop)} rot={[0.1, -1.25 + 0.55 * Math.sin(t * 0.9), 0]} nails={nails} strap={seg(t, 2.7, 3.2)} boot={false} /> : null}
    {t > 1.7 && t < 2.7 ? <Glow p={[0.1, 0.9, 1.95]} r={0.5} color="rgba(255,230,120,1)" o={0.6 * Math.sin((t - 1.7) * Math.PI)} /> : null}
    {t > 3.6 && t < 4.2 ? [-0.35, 0.45].map((x) => <Glow key={x} p={[x, 0.2, 0.3]} r={0.7} color="rgba(255,240,170,1)" o={0.8 * (1 - seg(t, 3.6, 4.2))} />) : null}
  </>);
};

/* =================== S2 5.15 – 10.76  Prohibition: whiskey illegal, stills hidden deep in the woods =================== */
const K2: Key[] = [
  { t: 5.0, pos: [2.0, 2.6, 8.4], look: [-0.4, 2.0, -1], fov: 50 },
  { t: 7.2, pos: [1.4, 2.7, 7.4], look: [-0.4, 2.1, -1], fov: 50 },
  { t: 8.6, pos: [1.0, 3.4, 7.0], look: [0.2, 2.0, -1], fov: 50 },
  { t: 10.9, pos: [0.0, 13.0, 19.0], look: [0, 0.5, -2], fov: 54 },
];
const S2 = ({ t, f }: Ctx) => {
  const sign = seg(t, 5.6, 5.95, Easing.out(Easing.back(2.2))), ill = seg(t, 7.28, 7.48, Easing.in(Easing.quad)), stir = t < 7.28;
  return (<>
    <Cam t={t} keys={K2} impacts={[[7.48, 0.03]]} />
    <ambientLight intensity={1.05} /><directionalLight position={[-6, 9, 4]} intensity={1.25} color="#ffc488" /><directionalLight position={[5, 3, 2]} intensity={0.45} color="#8aa8ff" />
    {dirt("#5f7a3a", "#587236")}<Box p={[0.5, 0.01, -0.4]} s={[7, 0.02, 5]} color="#7a5a3a" line={0.001} />
    <Woods t={t} n={34} r0={6.5} c={[0, 0, -1]} keepZ={2} dark />
    <Still p={[0, 0, -1]} t={t} />
    {[[2.9, 0.6], [3.4, 0.2], [3.1, -0.3]].map(([x, z], i) => <Jug key={i} p={[x, 0, z]} s={0.9} rotY={i * 0.6} />)}
    <Barrel p={[-2.6, 0, -2.2]} /><Barrel p={[-3.6, 0, -1.8]} s={0.9} /><Crate p={[3.8, 0, -1.8]} s={0.9} />
    <Box p={[-1.8, 0.25, 1.0]} s={[1.4, 0.18, 0.18]} rot={[0, 0.4, 0]} color="#6b4a2e" line={2} /><Box p={[-1.4, 0.25, 1.2]} s={[1.2, 0.18, 0.18]} rot={[0, -0.6, 0]} color="#6b4a2e" line={2} />
    <Glow p={[-3.2, 1.6, 0.2]} r={0.9} color="rgba(255,200,90,1)" o={0.6 + Math.sin(t * 7) * 0.06} /><Cyl p={[-3.2, 0.7, 0.2]} rt={0.05} h={1.4} color="#4a4a52" line={1} /><Cyl p={[-3.2, 1.55, 0.2]} rt={0.2} h={0.35} color="#ffd27a" line={2} />
    {/* PROHIBITION notice nailed on a post */}
    {sign > 0 ? <group position={[-2.3, 0, -3.4]}><Box p={[0, 1.4, 0]} s={[0.18, 2.8, 0.18]} color="#6b4a2e" line={2} />
      <CanvasPlane p={[0, 2.6, 0.12]} s={[2.4 * sign + 0.01, 1.1 * sign + 0.01]} px={[360, 165]} draw={(c, W, H) => { c.fillStyle = "#f2e2b8"; c.fillRect(0, 0, W, H); c.strokeStyle = INK; c.lineWidth = 10; c.strokeRect(5, 5, W - 10, H - 10); c.fillStyle = "#b8221e"; c.font = "900 50px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("PROHIBITION", W / 2, H * 0.4); c.fillStyle = INK; c.font = "800 30px Inter, Arial"; c.fillText("NO LIQUOR · 1920", W / 2, H * 0.76); }} /></group> : null}
    <Person p={[-1.7, 0, 0.2]} h={3.2} look={noHoof} f={f} pose={{ mood: t < 7.28 ? "smile" : t < 8.6 ? "gulp" : "deadpan", sweat: t > 7.4 && t < 9 ? 1 : 0, nerv: t > 7.4 && t < 8.4 ? 0.6 : 0, armR: stir ? [0.3 + 0.05 * Math.sin(t * 5), 0.55 + 0.03 * Math.cos(t * 5)] : undefined, armRK: 1, arms: !stir ? "chest" : undefined, armK: seg(t, 7.3, 7.5), lookX: t > 7.4 && t < 8.6 ? Math.sin(t * 9) : 0.6 }} />
    {stir ? <FaceGroup p={[-1.7, 0, 0.2]}><Box p={hand(3.2, [0.3 + 0.05 * Math.sin(t * 5), 0.55 + 0.03 * Math.cos(t * 5)])} s={[0.08, 1.3, 0.08]} rot={[0, 0, -0.5]} color="#8a5a32" line={1} /></FaceGroup> : null}
    <Stamp p={[0.2, 4.3, 0.2]} text="ILLEGAL" k={ill} s={[3.4, 1.15]} />
    <Dust t={t} area={[6, 4, 4]} color="rgba(255,200,120,.8)" />
  </>);
};

/* =================== S3 10.76 – 14.93  the problem: agents follow human footprints straight to the still =================== */
const BOOTS = Array.from({ length: 22 }, (_, i) => ({ x: (i % 2 ? 0.28 : -0.28) + Math.sin(i * 0.4) * 0.25, z: 3.2 - i * 0.85 }));
const K3: Key[] = [
  { t: 10.6, pos: [3.4, 1.7, 8.0], look: [0.6, 1.2, 2.6], fov: 50 },
  { t: 12.3, pos: [2.2, 2.6, 6.6], look: [0, 0.4, 0], fov: 52 },
  { t: 13.6, pos: [0.8, 3.0, -2.0], look: [0, 0.8, -12], fov: 54 },
  { t: 15.1, pos: [0.4, 3.2, -8.5], look: [0, 1.6, -16], fov: 54 },
];
const S3 = ({ t, f }: Ctx) => {
  const q = seg(t, 10.85, 11.15, Easing.out(Easing.back(2.4))) * (1 - seg(t, 11.5, 11.7));
  return (<>
    <Cam t={t} keys={K3} />
    <Lights warm="#ffe0b0" />
    {dirt("#6a8a40", "#628238")}<Path z0={5} z1={-18} w={2.4} />
    <Woods t={t} n={30} r0={4.5} c={[0, 0, -6]} keepZ={-30} />
    {[-2.2, 2.2].map((x) => <Woods key={x} t={t} n={8} r0={2.2} c={[x * 2.4, 0, -6]} keepZ={99} />)}
    {BOOTS.map((b, i) => <Print key={i} p={[b.x, 0, b.z]} kind="boot" rotY={0} s={1.1} glow={seg(t, 12.4 + i * 0.09, 12.6 + i * 0.09)} />)}
    <Still p={[0, 0, -17.5]} t={t} s={0.9} />
    <Glow p={[0, 1.4, -16.8]} r={2.4} color="rgba(255,200,90,1)" o={0.4 * seg(t, 13.9, 14.4)} />
    <Person p={[1.3, 0, 3.6]} h={3.1} look={agent} f={f} pose={{ mood: t < 13.6 ? "deadpan" : "grin", hunch: 0.5, squash: -0.08, armR: [0.3, 0.42], armRK: t < 12.6 ? 1 : 0, arms: t >= 12.6 ? "point" : undefined, armK: seg(t, 12.6, 12.9), flip: true, lookX: -1 }} />
    {t < 12.7 ? <FaceGroup p={[1.3, 0, 3.6]}><Magnifier p={hand(3.1, [0.3, 0.42], -0.08, false, 0.2)} s={0.8} /></FaceGroup> : null}
    <Qmark p={[1.3, 4.0, 3.4]} s={0.6 * q + 0.001} t={t} />
    <Fence p={[-3.4, 0, -2]} L={6} rotY={Math.PI / 2} />
  </>);
};

/* =================== S4 14.93 – 17.75  with these on, every step leaves the print of a cow =================== */
const xAt = (t: number) => -3.6 + clamp((t - 14.95) / 2.5) * 6.5;
const HOOVES = Array.from({ length: 11 }, (_, i) => -3.4 + i * 0.6);
const K4: Key[] = [14.8, 15.6, 16.4, 17.2, 17.9].map((tk) => { const x = xAt(tk); return { t: tk, pos: [x + 1.2, 0.75, 3.4] as V3, look: [x - 0.6, 0.25, 0] as V3, fov: 50 }; });
const S4 = ({ t, f }: Ctx) => {
  const x = xAt(t), moving = t > 14.95 && t < 17.45, cow = seg(t, 17.27, 17.5, Easing.out(Easing.back(2)));
  return (<>
    <Cam t={t} keys={K4} />
    <Lights warm="#ffe8c0" />
    {dirt("#6a8a40", "#628238")}<Box p={[0, 0.006, 0]} s={[20, 0.01, 2.2]} color="#8a6440" line={0.001} />
    {Array.from({ length: 14 }, (_, i) => <Tree key={i} p={[-9 + i * 1.6, 0, -3.5 - rnd(i) * 4]} s={1.3 + rnd(i + 2) * 0.6} t={t} />)}
    {Array.from({ length: 6 }, (_, i) => <Box key={i} p={[-6 + i * 2.6, 0.1, -1.6 - rnd(i) * 0.6]} s={[0.4, 0.2, 0.3]} rot={[0, i, 0]} color="#8a8478" line={2} />)}
    {HOOVES.map((hx, i) => <Print key={i} p={[hx, 0, i % 2 ? 0.25 : -0.15]} kind="hoof" rotY={-Math.PI / 2} s={1.1} k={clamp((x - hx - 0.3) * 4)} glow={i >= 8 ? cow : 0} />)}
    <Person p={[x, 0, 0]} h={3.2} look={shiner} f={f} pose={{ mood: "grin", walk: (x + 3.6) * WALK, speed: moving ? 0.6 : 0, lookX: 0.5 }} />
    {cow > 0 ? <Arrow3D p={[1.4, 1.1 + 0.1 * Math.sin(t * 8), 0.2]} rot={[0, 0, Math.PI]} L={1.1 * cow + 0.01} color="#ffd24a" depth={0.2} /> : null}
  </>);
};

/* =================== S5 17.75 – 22.39  the agent sees only cattle tracks and walks right on by =================== */
const K5: Key[] = [
  { t: 17.6, pos: [3.6, 1.1, 9.4], look: [0.0, 1.9, -1], fov: 52 },
  { t: 19.9, pos: [3.0, 1.2, 8.6], look: [0.0, 1.9, -1], fov: 50 },
  { t: 21.3, pos: [1.6, 1.2, 8.8], look: [-0.8, 1.9, -1], fov: 52 },
  { t: 22.6, pos: [0.0, 1.3, 9.2], look: [-1.8, 1.9, -1], fov: 54 },
];
const S5 = ({ t, f }: Ctx) => {
  const walk = Math.max(0, t - 21.15), ax = 1.6 - Math.min(walk, 1.3) * 4.2, moving = t > 21.15 && t < 22.45;
  const looking = t < 21.15, shrug = seg(t, 20.0, 20.3) * (1 - seg(t, 20.9, 21.1));
  return (<>
    <Cam t={t} keys={K5} />
    <Lights warm="#ffe0b0" />
    {dirt("#6a8a40", "#628238")}<Box p={[0, 0.006, 1.2]} s={[24, 0.01, 2.2]} color="#8a6440" line={0.001} />
    {Array.from({ length: 10 }, (_, i) => <Print key={i} p={[-3.4 + i * 0.75, 0, i % 2 ? 1.45 : 1.0]} kind="hoof" rotY={-Math.PI / 2} s={0.8} glow={t > 19.5 && t < 21 ? 0.5 + 0.5 * Math.sin(t * 8) : 0} />)}
    <Tree p={[-2.5, 0, -2.6]} s={2.0} t={t} />
    {Array.from({ length: 10 }, (_, i) => <Tree key={i} p={[-12 + i * 2.8, 0, -6 - rnd(i) * 5]} s={1.4 + rnd(i + 2) * 0.8} t={t} color={i % 2 ? "#3f8a3a" : "#4f9a3a"} />)}
    <Fence p={[3, 0, -1.5]} L={8} />
    {/* moonshiner peeks from behind the big tree */}
    <Person p={[-1.75, 0, -2.1]} h={3.0} look={shiner} f={f} pose={{ mood: t < 21.6 ? "worry" : "grin", sweat: t < 21.6 ? 1 : 0, nerv: t > 19.0 && t < 21.4 ? 0.55 : 0.2, hunch: 0.5, arms: "chest", armK: 1, lookX: 1 }} />
    <FaceGroup p={[-1.75, 0, -2.1]}><Jug p={[0.6, 0, 0.3]} s={0.8} /></FaceGroup>
    {/* the agent */}
    <Person p={[ax, 0, 1.4]} h={3.2} look={agent} f={f} pose={{ mood: t < 20.0 ? "deadpan" : t < 21.0 ? "worry" : "deadpan", hunch: looking ? 0.6 : 0, squash: looking ? -0.08 : 0, armR: looking && shrug < 0.5 ? [0.28, 0.4] : undefined, armRK: 1, arms: shrug > 0 ? "shrug" : undefined, armK: shrug, flip: true, lookX: -1, walk: Math.min(walk, 1.3) * 4.2 * WALK, speed: moving ? 0.6 : 0 }} />
    {looking && shrug < 0.5 ? <FaceGroup p={[ax, 0, 1.4]}><Magnifier p={hand(3.2, [0.28, 0.4], -0.08, true, 0.2)} s={0.8} /></FaceGroup> : null}
    {t > 20.0 && t < 21.2 ? <Qmark p={[ax, 4.3, 1.2]} s={0.55 * seg(t, 20.0, 20.25, Easing.out(Easing.back(2))) + 0.001} t={t} /> : null}
    <Dust t={t} area={[6, 3, 3]} />
  </>);
};

/* =================== S6 22.39 – 29.45  1922: a Florida prohibition official shows off a pair to the press =================== */
const K6: Key[] = [
  { t: 22.2, pos: [0, 5.6, 6.4], look: [0, 5.3, -1], fov: 50 },
  { t: 23.7, pos: [0, 5.0, 7.2], look: [0, 4.6, -1], fov: 52 },
  { t: 25.2, pos: [0.4, 3.0, 9.4], look: [0.2, 2.4, 0], fov: 54 },
  { t: 26.6, pos: [1.0, 3.0, 6.6], look: [0.8, 2.6, 0], fov: 50 },
  { t: 29.6, pos: [0.0, 3.4, 10.0], look: [0, 2.8, 0], fov: 56 },
];
const S6 = ({ t, f }: Ctx) => {
  const yr = seg(t, 22.45, 22.8, Easing.out(Easing.back(2))), fl = seg(t, 23.82, 24.1, Easing.out(Easing.back(2)));
  const lift = seg(t, 25.5, 25.9, Easing.out(Easing.back(1.6))), head = seg(t, 27.2, 27.5, Easing.out(Easing.back(2)));
  const flashes = [25.85, 26.2, 27.3, 28.3], fo = Math.max(...flashes.map((x) => (t > x && t < x + 0.25 ? 1 - (t - x) / 0.25 : 0)));
  const HR: [number, number] = [lerp(0.28, 0.4, lift), lerp(0.38, 0.6, lift)];
  return (<>
    <Cam t={t} keys={K6} />
    <ambientLight intensity={1.4 + fo * 1.2} /><directionalLight position={[4, 8, 5]} intensity={1.2} color="#fff0d8" /><directionalLight position={[-5, 3, 2]} intensity={0.5} color="#9ab8ff" />
    <Floor kind="plank" a="#9a6a3a" b="#8a5e32" unit={1.8} w={30} d={24} />
    <WallDoor z={-3.4} W={24} kind="wood" a="#d8c08a" b="#ccb47e" base="#5a3418" door={{ x: 6.0, w: 2.2, h: 4.0 }} />
    {/* window with Florida palms outside */}
    <Box p={[-4.4, 3.6, -3.32]} s={[3.2, 2.6, 0.06]} color="#9fd8f0" line={4} />{[-5.2, -3.6].map((x) => <Palm key={x} p={[x, 2.4, -3.36]} s={0.45} t={t} />)}
    <Box p={[-4.4, 3.6, -3.28]} s={[0.1, 2.6, 0.05]} color="#5a3418" line={2} />
    <CanvasPlane p={[3.0, 4.2, -3.3]} s={[2.6, 1.0]} px={[300, 115]} frame="#5a3418" draw={(c, W, H) => { c.fillStyle = "#2f6a8f"; c.fillRect(0, 0, W, H); c.fillStyle = "#fff"; c.font = "900 46px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("FLORIDA", W / 2, H / 2 + 2); }} />
    <Frame p={[0.4, 4.6, -3.3]} s={[1.4, 1.0]} art={2} /><Plant p={[-2.4, 0, -2.6]} s={1.1} /><Plant p={[4.8, 0, -2.6]} /><Lamp p={[-6.5, 0, -2.4]} h={2.4} />
    <Shaft p={[-4.2, 3.4, -1.6]} s={[2.4, 6.5]} rot={[0, 0, 0.45]} color="255,236,170" o={0.14} />
    <Counter p={[0, 5.4, -1.2]} s={[3.2 * yr + 0.01, 1.5 * yr + 0.01]} text="1922" color="#b8221e" sub={fl > 0.5 ? "FLORIDA" : " "} />
    <Desk p={[0.2, 0, 0.6]} w={4.2} top="#8a5a32" leg="#5a3418" />
    <Jug p={[-1.3, 1.6, 0.6]} s={0.7} />
    {/* the official holds up one cow shoe; its twin stays on the desk */}
    <Person p={[0.2, 0, -0.2]} h={3.4} look={official} f={f} pose={{ mood: t < 25.5 ? "smile" : "grin", armR: HR, armRK: 1, armL: t > 26.4 ? [-0.3, 0.55] : undefined, armLK: seg(t, 26.4, 26.7), lookX: 0.4 }} />
    <FaceGroup p={[0.2, 0, -0.2]}><CowShoe p={[hand(3.4, HR)[0] - 0.1, hand(3.4, HR)[1] - 0.42, 0.35]} s={0.7} rot={[0, -0.4, 0.1 * lift]} /></FaceGroup>
    <CowShoe p={[1.4, 1.62, 0.8]} s={0.7} rot={[0, -0.5, 0]} />
    {head > 0 ? <CanvasPlane p={[-1.5, 3.6, 1.6]} s={[2.3 * head + 0.01, 1.5 * head + 0.01]} rot={[0, 0.25, -0.06]} px={[400, 260]} draw={(c, W, H) => { c.fillStyle = "#f4efe2"; c.fillRect(0, 0, W, H); c.strokeStyle = INK; c.lineWidth = 8; c.strokeRect(4, 4, W - 8, H - 8); c.fillStyle = INK; c.font = "900 30px Inter, Arial"; c.textAlign = "center"; c.fillText("THE DAILY NEWS · 1922", W / 2, 44); c.fillRect(20, 58, W - 40, 5); c.font = "900 66px Inter, Arial"; c.fillText("COW SHOES!", W / 2, 132); c.font = "800 24px Inter, Arial"; c.fillText("latest trick from moonshine country", W / 2, 180); c.fillStyle = "#aaa"; for (let i = 0; i < 3; i++) c.fillRect(30, 205 + i * 14, W - 60 - i * 50, 7); }} /> : null}
    {press.map((lk, i) => { const x = i ? 2.3 : -2.4; return <React.Fragment key={i}>
      <Person p={[x, 0, 3.2]} h={2.8} look={lk} f={f + i * 7} pose={{ mood: t > 25.6 ? "shock" : "smile", armR: [0.18, 0.62], armRK: 1, armL: [-0.1, 0.62], armLK: 1, flip: i === 1, lookX: i ? -1 : 1 }} />
      <FaceGroup p={[x, 0, 3.2]}><PressCam p={hand(2.8, [0.05, 0.62], 0, i === 1, 0.3)} s={1.4} /></FaceGroup>
      {fo > 0 ? <Glow p={[x + (i ? -0.3 : 0.3), 1.9, 3.5]} r={1.4} color="rgba(255,255,255,1)" o={fo} /> : null}
    </React.Fragment>; })}
  </>);
};

/* =================== S7 29.45 – 32.6  the idea may have come from a Sherlock Holmes story (loops back to the shoe) =================== */
const K7: Key[] = [
  { t: 29.3, pos: [-0.4, 2.4, 9.0], look: [-0.4, 2.2, 0], fov: 54 },
  { t: 31.0, pos: [0.2, 2.6, 8.6], look: [0.2, 2.2, 0], fov: 54 },
  { t: 31.9, pos: [0.6, 2.4, 8.0], look: [0.4, 1.9, 0.6], fov: 52 },
  { t: 32.75, pos: [2.5, 0.95, 4.6], look: [1.5, 0.45, 1.6], fov: 40 },
];
const S7 = ({ t, f }: Ctx) => {
  const q = seg(t, 29.72, 30.0, Easing.out(Easing.back(2.4))) * (1 - seg(t, 31.0, 31.2)), bk = seg(t, 31.0, 31.5, Easing.out(Easing.back(1.6)));
  const rise = seg(t, 32.0, 32.6, Easing.inOut(Easing.cubic)), shock = t > 31.78 && t < 32.3, air = shock ? Math.sin(clamp((t - 31.78) / 0.4) * Math.PI) : 0;
  return (<>
    <Cam t={t} keys={K7} impacts={[[31.2, 0.02]]} />
    <ambientLight intensity={1.45} /><directionalLight position={[3, 8, 6]} intensity={1.25} color="#fff4e0" /><directionalLight position={[-5, 3, 2]} intensity={0.5} color="#9ad8ff" />
    <Studio />
    <Person p={[-1.3, air * 0.5, 0.2]} sy={0} h={3.2} look={shiner} f={f} pose={{ mood: shock ? "shock" : t > 32.3 ? "grin" : "worry", arms: t < 31.0 ? "head" : shock ? "up" : undefined, armK: 1, air: air, squash: shock ? 0.1 * air : 0, lookX: t > 31.0 ? 1 : 0 }} />
    <Qmark p={[-1.3, 4.6, 0.1]} s={0.7 * q + 0.001} t={t} />
    {bk > 0 ? <Book p={[1.5, 0, -0.6]} s={0.85 * bk + 0.01} open={bk} title="SHERLOCK HOLMES" sub="The Priory School" /> : null}
    {bk > 0 ? <CowShoe p={[1.5, lerp(0, 0.55 + Math.sin(t * 2) * 0.04, rise), 1.6]} s={bk} rot={[0.1 * rise, -1.25 + 0.55 * Math.sin(t * 0.9), 0]} boot={false} /> : null}
    {bk > 0.5 ? <Glow p={[1.5, 1.4, 0.4]} r={2.4} color="rgba(255,240,180,1)" o={0.35} /> : null}
  </>);
};

const CUTS = [0, 5.15, 10.76, 14.93, 17.75, 22.39, 29.45, 32.6];
export const CowShoes: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("mix.wav")} />
      <Scene first start={CUTS[0]} end={CUTS[1]} bg="#5fb3c8">{(c) => <S1 {...c} />}</Scene>
      <Scene start={CUTS[1]} end={CUTS[2]} bg="#e89a5c" trans="whip">{(c) => <S2 {...c} />}</Scene>
      <Scene start={CUTS[2]} end={CUTS[3]} bg="#9fd0ec">{(c) => <S3 {...c} />}</Scene>
      <Scene start={CUTS[3]} end={CUTS[4]} bg="#9fd0ec" trans="whip">{(c) => <S4 {...c} />}</Scene>
      <Scene start={CUTS[4]} end={CUTS[5]} bg="#a8d6f0">{(c) => <S5 {...c} />}</Scene>
      <Scene start={CUTS[5]} end={CUTS[6]} bg="#d8c08a" trans="flash">{(c) => <S6 {...c} />}</Scene>
      <Scene start={CUTS[6]} end={CUTS[7]} bg="#5fb3c8" trans="zoom">{(c) => <S7 {...c} />}</Scene>
      <Grade t={t} shaft={false} tint={t < 5.15 ? "rgba(255,220,150,.03)" : t < 10.76 ? "rgba(255,140,60,.08)" : t < 22.39 ? "rgba(255,220,150,.04)" : t < 29.45 ? "rgba(255,200,120,.05)" : "rgba(255,220,150,.03)"} />
      <Captions />
    </AbsoluteFill>
  );
};
void Cyl;
