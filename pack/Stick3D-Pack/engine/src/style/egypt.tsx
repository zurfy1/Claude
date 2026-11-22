// Egypt props (v5): Pyramid, Obelisk, Palm, MudHouse, HandCart, Cat (billboard, 5 poses), Jar, Crate, Torch, Scales, Papyrus, Hieroglyph wall, Banner.
import React, { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { Box, Cyl, Ball, CanvasPlane, Billboard, INK } from "./toon";
import { V3 } from "./kit";
import { Glow } from "./props";

const ramp = (() => { const d = new Uint8Array([90, 170, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();

// generic outlined 4-sided prism / pyramid (rt = top radius, rb = bottom radius, 45deg so faces are flat to the camera)
export const Prism: React.FC<{ p: V3; rt: number; rb: number; h: number; color: string; rotY?: number; line?: number }> = ({ p, rt, rb, h, color, rotY = 0, line = 3 }) => {
  const { size } = useThree();
  const geo = useMemo(() => { const g = new THREE.CylinderGeometry(rt, rb, h, 4, 1); g.rotateY(Math.PI / 4); return g; }, [rt, rb, h]);
  const seg = useMemo(() => { const e = new LineSegmentsGeometry(); e.setPositions(new THREE.EdgesGeometry(geo, 20).attributes.position.array as Float32Array); return new LineSegments2(e, new LineMaterial({ color: new THREE.Color(INK).getHex(), linewidth: line, resolution: new THREE.Vector2(size.width, size.height) })); }, [geo, size, line]);
  return <group position={[p[0], p[1] + h / 2, p[2]]} rotation={[0, rotY, 0]}><mesh geometry={geo}><meshToonMaterial color={color} gradientMap={ramp} /></mesh><primitive object={seg} /></group>;
};
export const Pyramid: React.FC<{ p: V3; base: number; h: number; color?: string; rotY?: number }> = ({ p, base, h, color = "#e9bd62", rotY = 0.2 }) => (
  <Prism p={p} rt={0.001} rb={base * 0.7071} h={h} color={color} rotY={rotY} line={3} />
);
export const Obelisk: React.FC<{ p: V3; h?: number; color?: string }> = ({ p, h = 6, color = "#d9a85a" }) => (
  <group position={p}><Prism p={[0, 0, 0]} rt={0.28} rb={0.5} h={h} color={color} /><Prism p={[0, h, 0]} rt={0.001} rb={0.28} h={0.5} color="#ffc23a" />
    <Box p={[0, 0.15, 0]} s={[1.5, 0.3, 1.5]} color="#b98a45" line={3} /></group>
);
export const Palm: React.FC<{ p: V3; s?: number; lean?: number; t?: number }> = ({ p, s = 1, lean = 0.15, t = 0 }) => (
  <group position={p} scale={s}>
    {[0, 1, 2, 3].map((i) => <Cyl key={i} p={[Math.sin(lean) * (i + 0.5) * 0.9, 0.55 + i * 0.95, 0]} rt={0.17 - i * 0.01} rb={0.2 - i * 0.01} h={1.05} color="#b27a3e" rot={[0, 0, -lean]} line={2} />)}
    <group position={[Math.sin(lean) * 4 * 0.9, 3.95, 0]}>
      {[0, 1, 2, 3, 4, 5].map((i) => { const a = (i / 6) * Math.PI * 2, sway = Math.sin(t * 1.3 + i) * 0.03;
        return <group key={i} rotation={[0, a, 0]}><group rotation={[0, 0, -0.55 + sway]}><Ball p={[1.05, 0, 0]} r={0.55} s={[1.9, 0.14, 0.5]} color={i % 2 ? "#2f9d3e" : "#3bb44a"} ink={0.05} /></group></group>; })}
      <Ball p={[0.1, -0.1, 0.1]} r={0.2} color="#7a4a22" ink={0.04} />
    </group>
  </group>
);
export const MudHouse: React.FC<{ p: V3; w: number; h: number; d?: number; color?: string; door?: boolean; awning?: string; rotY?: number }> = ({ p, w, h, d = 2.4, color = "#d99a5b", door = true, awning, rotY = 0 }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <Box p={[0, h / 2, 0]} s={[w, h, d]} color={color} /><Box p={[0, h + 0.12, 0]} s={[w + 0.3, 0.24, d + 0.3]} color="#c28445" line={3} />
    {door ? <Box p={[0, 0.95, d / 2 + 0.02]} s={[1.1, 1.9, 0.08]} color="#3a1f12" line={2} /> : null}
    <Box p={[w * 0.3, h * 0.72, d / 2 + 0.02]} s={[0.55, 0.45, 0.08]} color="#2a1810" line={2} />
    {awning ? <><Box p={[0, h * 0.62, d / 2 + 0.55]} s={[w * 0.9, 0.1, 1.2]} color={awning} line={3} rot={[0.25, 0, 0]} /><Cyl p={[-w * 0.42, h * 0.3, d / 2 + 1.0]} rt={0.06} h={h * 0.6} color="#8a5a32" line={2} /><Cyl p={[w * 0.42, h * 0.3, d / 2 + 1.0]} rt={0.06} h={h * 0.6} color="#8a5a32" line={2} /></> : null}
  </group>
);
export const Jar: React.FC<{ p: V3; s?: number; color?: string }> = ({ p, s = 1, color = "#c2552b" }) => (
  <group position={p} scale={s}><Ball p={[0, 0.45, 0]} r={0.42} s={[1, 1.15, 1]} color={color} ink={0.05} /><Cyl p={[0, 0.98, 0]} rt={0.2} rb={0.16} h={0.2} color={color} line={2} /><Box p={[0, 0.5, 0.4]} s={[0.5, 0.06, 0.02]} color="#ffd770" line={1} /></group>
);
export const Crate: React.FC<{ p: V3; s?: number; rotY?: number; color?: string }> = ({ p, s = 1, rotY = 0, color = "#a8733a" }) => (
  <group position={p} rotation={[0, rotY, 0]} scale={s}><Box p={[0, 0.45, 0]} s={[0.9, 0.9, 0.9]} color={color} /><Box p={[0, 0.45, 0.46]} s={[0.9, 0.12, 0.02]} color="#6a4524" line={1} /></group>
);
export const Torch: React.FC<{ p: V3; t: number; h?: number }> = ({ p, t, h = 2.2 }) => (
  <group position={p}><Cyl p={[0, h / 2, 0]} rt={0.07} h={h} color="#5a3a22" line={2} /><Cyl p={[0, h + 0.12, 0]} rt={0.17} rb={0.09} h={0.3} color="#ffb020" line={2} />
    <Ball p={[0, h + 0.42 + Math.sin(t * 20) * 0.03, 0]} r={0.2} s={[0.8, 1.4, 0.8]} color="#ff7a1c" ink={0.04} /><Glow p={[0, h + 0.4, 0.2]} r={1.3} color="rgba(255,170,60,1)" o={0.5 + 0.1 * Math.sin(t * 17)} /></group>
);
export const Banner: React.FC<{ p: V3; s: [number, number]; color: string; draw?: (c: CanvasRenderingContext2D, W: number, H: number) => void; sway?: number; rot?: V3 }> = ({ p, s, color, draw, sway = 0, rot = [0, 0, 0] }) => (
  <group position={p} rotation={rot}><Box p={[0, s[1] / 2 + 0.06, 0]} s={[s[0] + 0.3, 0.12, 0.12]} color="#c9a227" line={2} />
    <group rotation={[0, sway, 0]}><CanvasPlane p={[0, 0, 0]} s={s} px={[Math.round(s[0] * 80), Math.round(s[1] * 80)]} frame={color} draw={(c, W, H) => { c.fillStyle = color; c.fillRect(0, 0, W, H); draw?.(c, W, H); }} /></group></group>
);
// wall of simple hieroglyphs (eye, ankh, waves, bird, cat) drawn in ink on sandstone
export const Hiero: React.FC<{ p: V3; s: [number, number]; rot?: V3; bg?: string; ink?: string; seed?: number }> = ({ p, s, rot, bg = "#e2b45f", ink = "#7a3b12", seed = 3 }) => (
  <CanvasPlane p={p} s={s} rot={rot} px={[Math.round(s[0] * 60), Math.round(s[1] * 60)]} draw={(c, W, H) => {
    c.fillStyle = bg; c.fillRect(0, 0, W, H); c.strokeStyle = ink; c.fillStyle = ink; c.lineWidth = 3; c.lineCap = "round"; let n = seed * 31;
    const cell = 46; for (let y = 14; y < H - cell; y += cell + 8) for (let x = 12; x < W - cell; x += cell + 6) {
      n = (n * 9301 + 49297) % 233280; const k = Math.floor((n / 233280) * 5); c.save(); c.translate(x + cell / 2, y + cell / 2); c.beginPath();
      if (k === 0) { c.ellipse(0, 0, 16, 9, 0, 0, 7); c.stroke(); c.beginPath(); c.arc(0, 0, 4, 0, 7); c.fill(); c.moveTo(-6, 10); c.lineTo(-10, 18); c.stroke(); }
      else if (k === 1) { c.arc(0, -8, 7, 0, 7); c.moveTo(0, -1); c.lineTo(0, 18); c.moveTo(-10, 6); c.lineTo(10, 6); c.stroke(); }
      else if (k === 2) { for (let i = 0; i < 3; i++) { c.moveTo(-18, -8 + i * 9); c.quadraticCurveTo(-9, -15 + i * 9, 0, -8 + i * 9); c.quadraticCurveTo(9, -1 + i * 9, 18, -8 + i * 9); } c.stroke(); }
      else if (k === 3) { c.ellipse(0, 2, 14, 8, 0, 0, 7); c.moveTo(12, 0); c.lineTo(20, -10); c.moveTo(-14, 2); c.lineTo(-20, 12); c.stroke(); }
      else { c.moveTo(-14, 16); c.lineTo(-14, -2); c.lineTo(-9, -12); c.lineTo(-5, -2); c.lineTo(5, -2); c.lineTo(9, -12); c.lineTo(14, -2); c.lineTo(14, 16); c.closePath(); c.stroke(); }
      c.restore();
    }
  }} />
);

/* ---------- the cat (side view, faces +x; flip to face -x) ---------- */
export type CatPose = "run" | "scared" | "lie" | "sit" | "statue";
export function drawCat(c: CanvasRenderingContext2D, W: number, H: number, pose: CatPose, t: number, flip = false, hurt = 0) {
  c.clearRect(0, 0, W, H); c.save(); if (flip) { c.translate(W, 0); c.scale(-1, 1); }
  const gold = pose === "statue", fur = gold ? "#ffcf3a" : "#f0902a", dark = gold ? "#c98f12" : "#b85a12", belly = gold ? "#ffe88a" : "#ffe2b8";
  c.lineJoin = "round"; c.lineCap = "round"; c.strokeStyle = INK; c.lineWidth = 9;
  const gy = H * 0.983, cx = W * 0.5;
  const ell = (x: number, y: number, rx: number, ry: number, rot: number, fill: string) => { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, 7); c.fillStyle = fill; c.fill(); c.stroke(); };
  const ear = (x: number, y: number, k: number) => { c.beginPath(); c.moveTo(x - 18 * k, y); c.lineTo(x - 4 * k, y - 46 * k); c.lineTo(x + 20 * k, y - 2); c.closePath(); c.fillStyle = fur; c.fill(); c.stroke(); };
  const eye = (x: number, y: number, open: number, look = 1) => { if (open > 0.4) { ell(x, y, 11, 13 * open, 0, "#fff"); c.beginPath(); c.arc(x + look * 3, y, 5, 0, 7); c.fillStyle = INK; c.fill(); } else { c.beginPath(); c.moveTo(x - 10, y); c.quadraticCurveTo(x, y + 6, x + 10, y); c.lineWidth = 6; c.stroke(); c.lineWidth = 9; } };
  const stripes = (x: number, y: number, n: number, len: number) => { c.save(); c.lineWidth = 6; c.strokeStyle = dark; for (let i = 0; i < n; i++) { c.beginPath(); c.moveTo(x + i * 22, y); c.lineTo(x + i * 22 - 4, y + len); c.stroke(); } c.restore(); c.lineWidth = 9; };
  if (pose === "run") {
    const ph = t * 16, by = gy - 70 - Math.abs(Math.sin(ph)) * 10;
    for (const s of [0, 1]) { const a = Math.sin(ph + s * Math.PI) * 38; for (const side of [-1, 1]) { c.beginPath(); c.moveTo(cx + side * 60, by + 10); c.lineTo(cx + side * 60 + a * side * 0.5 + (side > 0 ? 24 : -24) * (s ? 1 : -1) * 0.3, gy - 6 - (Math.max(0, Math.cos(ph + s * Math.PI)) * 18)); c.lineWidth = 16; c.strokeStyle = INK; c.stroke(); c.lineWidth = 9; c.strokeStyle = INK; } }
    ell(cx, by, 92, 44, 0, fur); stripes(cx - 50, by - 36, 4, 24); ell(cx + 6, by + 14, 70, 22, 0, belly);
    c.beginPath(); c.moveTo(cx - 88, by - 8); c.quadraticCurveTo(cx - 150, by - 70 + Math.sin(ph) * 14, cx - 120, by - 124); c.lineWidth = 16; c.stroke(); c.strokeStyle = fur; c.lineWidth = 9; c.stroke(); c.strokeStyle = INK; c.lineWidth = 9;
    ell(cx + 104, by - 20, 40, 36, 0, fur); ear(cx + 90, by - 42, 1); ear(cx + 120, by - 42, 1); eye(cx + 114, by - 24, 1); ell(cx + 138, by - 8, 6, 5, 0, "#ff7a8a");
  } else if (pose === "scared") {
    const sh = Math.sin(t * 40) * 2.2; // arched, fur up, tail puffed, eyes huge
    for (const dx of [-62, -26, 30, 66]) { c.beginPath(); c.moveTo(cx + dx + sh, gy - 52); c.lineTo(cx + dx + sh, gy - 6); c.lineWidth = 16; c.stroke(); c.strokeStyle = fur; c.lineWidth = 9; c.stroke(); c.strokeStyle = INK; }
    c.beginPath(); c.moveTo(cx - 100 + sh, gy - 50); c.quadraticCurveTo(cx + sh, gy - 190, cx + 100 + sh, gy - 60); c.quadraticCurveTo(cx + sh, gy - 40, cx - 100 + sh, gy - 50); c.fillStyle = fur; c.fill(); c.stroke();
    stripes(cx - 50 + sh, gy - 118, 4, 30);
    c.beginPath(); c.moveTo(cx - 98 + sh, gy - 60); c.quadraticCurveTo(cx - 150, gy - 130, cx - 112, gy - 190); c.lineWidth = 28; c.stroke(); c.strokeStyle = fur; c.lineWidth = 16; c.stroke(); c.strokeStyle = INK; c.lineWidth = 9;
    ell(cx + 112 + sh, gy - 92, 42, 38, 0, fur); ear(cx + 98 + sh, gy - 116, 1); ear(cx + 128 + sh, gy - 116, 1); eye(cx + 120 + sh, gy - 98, 1.5); ell(cx + 150 + sh, gy - 78, 6, 5, 0, "#ff7a8a");
  } else if (pose === "lie") {
    const ox = hurt ? 0 : 0; // flat on its side, eyes closed, limbs relaxed
    ell(cx + ox, gy - 34, 100, 32, 0.02, fur); stripes(cx - 56, gy - 60, 4, 22); ell(cx + 10, gy - 22, 70, 14, 0, belly);
    for (const [dx, dy, len] of [[-60, -8, 40], [-26, -6, 36], [34, -6, 38], [70, -10, 44]]) { c.beginPath(); c.moveTo(cx + dx, gy + dy - 20); c.lineTo(cx + dx + len * 0.6, gy - 6 + (dx > 0 ? -4 : 0)); c.lineWidth = 15; c.stroke(); c.strokeStyle = fur; c.lineWidth = 8; c.stroke(); c.strokeStyle = INK; c.lineWidth = 9; }
    c.beginPath(); c.moveTo(cx - 98, gy - 30); c.quadraticCurveTo(cx - 170, gy - 22, cx - 190, gy - 8); c.lineWidth = 16; c.stroke(); c.strokeStyle = fur; c.lineWidth = 9; c.stroke(); c.strokeStyle = INK; c.lineWidth = 9;
    ell(cx + 118, gy - 30, 40, 32, 0.08, fur); ear(cx + 104, gy - 54, 0.9); ear(cx + 134, gy - 52, 0.9); eye(cx + 126, gy - 34, 0); ell(cx + 150, gy - 18, 6, 5, 0, "#ff7a8a");
  } else { // sit / statue (upright)
    const br = Math.sin(t * 2) * 1.5;
    ell(cx, gy - 100, 62, 98 + br, 0, fur); ell(cx + 6, gy - 86, 36, 66, 0, belly); stripes(cx - 34, gy - 170, 3, 30);
    ell(cx - 34, gy - 18, 30, 16, 0, fur); ell(cx + 36, gy - 18, 30, 16, 0, fur);
    c.beginPath(); c.moveTo(cx - 52, gy - 30); c.quadraticCurveTo(cx - 130, gy - 8, cx - 112, gy - 90); c.lineWidth = 20; c.stroke(); c.strokeStyle = fur; c.lineWidth = 11; c.stroke(); c.strokeStyle = INK; c.lineWidth = 9;
    ell(cx + 8, gy - 214, 52, 46, 0, fur); ear(cx - 18, gy - 238, 1.25); ear(cx + 34, gy - 238, 1.25);
    if (gold) { c.beginPath(); c.arc(cx + 8, gy - 168, 40, 0.2, Math.PI - 0.2); c.lineWidth = 12; c.strokeStyle = "#2f9cff"; c.stroke(); c.strokeStyle = INK; c.lineWidth = 9; eye(cx - 12, gy - 220, 1); eye(cx + 28, gy - 220, 1); c.fillStyle = "#2f9cff"; c.beginPath(); c.arc(cx + 8, gy - 150, 9, 0, 7); c.fill(); c.stroke(); }
    else { eye(cx - 12, gy - 220, 1); eye(cx + 28, gy - 220, 1); }
    ell(cx + 8, gy - 200, 7, 5, 0, "#ff7a8a");
  }
  c.restore();
}
export const Cat: React.FC<{ p: V3; h?: number; pose: CatPose; t: number; flip?: boolean; hurt?: number }> = ({ p, h = 2.4, pose, t, flip, hurt }) => (
  <Billboard p={p} h={h} draw={(c, W, H) => drawCat(c, W, H, pose, t, flip, hurt)} />
);

/* ---------- hand cart with ONE big front wheel; wheel spins with distance ---------- */
export const HandCart: React.FC<{ p: V3; spin: number; bump?: number; tilt?: number; load?: boolean }> = ({ p, spin, bump = 0, tilt = 0, load = true }) => {
  const R = 0.56;
  return (
    <group position={[p[0], p[1] + bump, p[2]]}>
      <group rotation={[0, 0, tilt]}>
        <Box p={[-0.95, 0.95, 0]} s={[1.9, 0.14, 1.0]} color="#9a6531" /><Box p={[-0.95, 1.35, 0.5]} s={[1.9, 0.7, 0.08]} color="#a8733a" line={3} /><Box p={[-0.95, 1.35, -0.5]} s={[1.9, 0.7, 0.08]} color="#a8733a" line={3} /><Box p={[-1.9, 1.35, 0]} s={[0.08, 0.7, 1.0]} color="#8a5a2c" line={3} />
        {load ? <><Jar p={[-0.55, 1.0, 0.1]} s={1.05} /><Jar p={[-1.3, 1.0, -0.15]} s={0.95} color="#2f8f9a" /><Crate p={[-1.55, 0.98, 0.18]} s={0.7} /></> : null}
      </group>
      <group position={[0, R, 0]} rotation={[0, 0, -spin]}>
        <Cyl p={[0, 0, 0]} rt={R} h={0.14} color="#7a4a22" rot={[Math.PI / 2, 0, 0]} line={3} />
        {[0, 1, 2, 3].map((i) => <Box key={i} p={[0, 0, 0.09]} s={[R * 2 - 0.1, 0.07, 0.04]} rot={[0, 0, (i * Math.PI) / 4]} color="#d9a85a" line={1} />)}
        <Cyl p={[0, 0, 0.1]} rt={0.11} h={0.12} color="#ffc23a" rot={[Math.PI / 2, 0, 0]} line={2} />
      </group>
      <Box p={[-0.1, 0.78, 0]} s={[0.22, 0.55, 0.14]} color="#7a4a22" line={2} />
    </group>
  );
};

/* ---------- balance scales; beam angle a (rad, + = right side down) ---------- */
export const Scales: React.FC<{ p: V3; a: number; L?: number; left?: React.ReactNode; right?: React.ReactNode }> = ({ p, a, L = 2.6, left, right }) => {
  const yl = 4.2 - Math.sin(a) * L, yr = 4.2 + Math.sin(a) * L; // a>0 lifts the RIGHT pan
  return (<group position={p}>
    <Box p={[0, 0.2, 0]} s={[2.2, 0.4, 1.2]} color="#c9a227" /><Cyl p={[0, 2.2, 0]} rt={0.14} rb={0.2} h={4} color="#e0b63a" /><Ball p={[0, 4.2, 0]} r={0.28} color="#ffd24a" />
    <group position={[0, 4.2, 0]} rotation={[0, 0, a]}><Box p={[0, 0, 0]} s={[L * 2, 0.16, 0.22]} color="#e0b63a" line={3} /></group>
    {([[-1, yl, left], [1, yr, right]] as [number, number, React.ReactNode][]).map(([sx, y, ch], i) => { const x = sx * Math.cos(a) * L; return (
      <group key={i} position={[x, y, 0]}>
        {[-0.6, 0.6].map((d) => <Box key={d} p={[d * 0.5, -0.9, 0]} s={[0.04, 1.8, 0.04]} rot={[0, 0, -d * 0.35]} color="#c9a227" line={1} />)}
        <Cyl p={[0, -1.75, 0]} rt={1.15} rb={0.9} h={0.22} color="#ffd24a" />{ch ? <group position={[0, -1.64, 0]}>{ch}</group> : null}
      </group>); })}
  </group>);
};
