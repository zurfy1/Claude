// Ancient Greece props (v7): Column, Temple, StoneBench, Mountain, Cliff, Chasm, Bone, Bundle (swaddled baby, billboard), Shield, Spear, Rope, Magnifier, PosterBoard, Bowl, Stamp, Qmark.
import React from "react";
import { Box, Cyl, Ball, CanvasPlane, Billboard, INK } from "./toon";
import { V3 } from "./kit";
import { Prism } from "./egypt";
import { Extrude } from "./extra";

export const Column: React.FC<{ p: V3; h?: number; r?: number; color?: string; broken?: boolean }> = ({ p, h = 5, r = 0.4, color = "#efe6d0", broken }) => (
  <group position={p}>
    <Box p={[0, 0.15, 0]} s={[r * 2.8, 0.3, r * 2.8]} color={color} line={3} />
    <Cyl p={[0, (broken ? h * 0.6 : h) / 2 + 0.3, 0]} rt={r * 0.9} rb={r} h={broken ? h * 0.6 : h} color={color} />
    {!broken ? <><Cyl p={[0, h + 0.4, 0]} rt={r * 1.4} rb={r} h={0.25} color={color} line={3} /><Box p={[0, h + 0.62, 0]} s={[r * 3.2, 0.2, r * 3.2]} color={color} line={3} /></> : null}
    {[0, 1, 2, 3, 4, 5].map((i) => <Box key={i} p={[Math.cos(i * 1.047) * r * 0.97, (broken ? h * 0.6 : h) / 2 + 0.3, Math.sin(i * 1.047) * r * 0.97]} s={[0.03, (broken ? h * 0.6 : h) * 0.95, 0.03]} color="#c9bfa8" line={0.5} />)}
  </group>
);
export const Temple: React.FC<{ p: V3; w?: number; n?: number; h?: number; color?: string }> = ({ p, w = 10, n = 5, h = 5, color = "#efe6d0" }) => (
  <group position={p}>
    {[0, 1].map((i) => <Box key={i} p={[0, 0.2 + i * 0.4, 0.3 * (1 - i)]} s={[w + 1.4 - i * 0.6, 0.4, 3.4 - i * 0.6]} color={color} line={3} />)}
    {Array.from({ length: n }, (_, i) => <Column key={i} p={[-w / 2 + (i + 0.5) * w / n, 0.8, 0]} h={h} color={color} />)}
    <Box p={[0, h + 1.75, 0]} s={[w + 0.6, 0.7, 2.6]} color={color} line={3} />
    <Extrude pts={[[-w / 2 - 0.4, 0], [w / 2 + 0.4, 0], [0, 1.8]]} depth={2.6} p={[0, h + 2.1, 0]} color="#e6dcc2" line={3} />
    <CanvasPlane p={[0, h + 1.75, 1.32]} s={[w + 0.4, 0.5]} px={[Math.round(w * 50), 25]} draw={(c, W, H) => { c.fillStyle = "#c8302f"; c.fillRect(0, 0, W, H); c.strokeStyle = "#ffd24a"; c.lineWidth = 3; c.beginPath(); for (let x = 0; x < W; x += 20) { c.moveTo(x, H - 4); c.lineTo(x, 6); c.lineTo(x + 12, 6); c.lineTo(x + 12, H - 10); c.lineTo(x + 6, H - 10); } c.stroke(); }} />
  </group>
);
export const StoneBench: React.FC<{ p: V3; w?: number; rotY?: number }> = ({ p, w = 5, rotY = 0 }) => (
  <group position={p} rotation={[0, rotY, 0]}><Box p={[0, 0.75, 0]} s={[w, 0.3, 1.1]} color="#d8ccb0" /><Box p={[-w / 2 + 0.4, 0.3, 0]} s={[0.5, 0.6, 0.9]} color="#c9bd9f" line={3} /><Box p={[w / 2 - 0.4, 0.3, 0]} s={[0.5, 0.6, 0.9]} color="#c9bd9f" line={3} /></group>
);
export const Mountain: React.FC<{ p: V3; base: number; h: number; color?: string; snow?: boolean; rotY?: number }> = ({ p, base, h, color = "#7d8a6a", snow = true, rotY = 0.3 }) => (
  <group position={p}><Prism p={[0, 0, 0]} rt={0.001} rb={base * 0.7} h={h} color={color} rotY={rotY} />{snow ? <Prism p={[0, h * 0.72, 0]} rt={0.001} rb={base * 0.7 * 0.28 + 0.02} h={h * 0.28 + 0.02} color="#f4f6fa" rotY={rotY} /> : null}</group>
);
// a cliff block whose top surface is at y=0 and front face at z=0, dropping down by `drop`
export const Cliff: React.FC<{ p: V3; w?: number; d?: number; drop?: number; color?: string; top?: string }> = ({ p, w = 12, d = 12, drop = 14, color = "#a07a52", top = "#7aa84a" }) => (
  <group position={p}>
    <Box p={[0, -drop / 2, -d / 2]} s={[w, drop, d]} color={color} />
    <Box p={[0, 0.08, -d / 2]} s={[w + 0.1, 0.16, d + 0.1]} color={top} line={3} />
    {Array.from({ length: 7 }, (_, i) => <Box key={i} p={[-w / 2 + (i + 0.5) * w / 7, -1.5 - (i % 3) * 3.2, 0.25]} s={[w / 7 * 0.8, 1.4 + (i % 2), 0.5]} color={i % 2 ? "#8a6a44" : "#b08a5e"} line={2} />)}
  </group>
);
// dark crack in the ground (seen from above) with rocky lips
export const Chasm: React.FC<{ p: V3; w?: number; l?: number; rotY?: number }> = ({ p, w = 2.6, l = 9, rotY = 0 }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <CanvasPlane p={[0, 0.03, 0]} rot={[-Math.PI / 2, 0, 0]} s={[l, w]} px={[360, 104]} draw={(c, W, H) => { c.clearRect(0, 0, W, H); const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#2a1a10"); g.addColorStop(0.5, "#050308"); g.addColorStop(1, "#2a1a10"); c.fillStyle = g; c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(4, H / 2); for (let x = 0; x <= W; x += 24) c.lineTo(x, H * 0.1 + Math.sin(x * 0.11) * 8 + (x / W) * 4); c.lineTo(W - 4, H / 2); for (let x = W; x >= 0; x -= 24) c.lineTo(x, H * 0.9 + Math.cos(x * 0.13) * 8); c.closePath(); c.fill(); c.stroke(); }} />
    {Array.from({ length: 8 }, (_, i) => <Box key={i} p={[-l / 2 + (i + 0.5) * l / 8, 0.15, (i % 2 ? 1 : -1) * w * 0.55]} s={[0.9, 0.3 + (i % 3) * 0.1, 0.6]} rot={[0, i, 0]} color="#8a7458" line={2} />)}
  </group>
);
export const Bone: React.FC<{ p: V3; rot?: V3; s?: number }> = ({ p, rot = [0, 0, 0], s = 1 }) => (
  <group position={p} rotation={rot} scale={s}><Cyl p={[0, 0, 0]} rt={0.08} h={0.9} color="#f3ecd6" rot={[0, 0, Math.PI / 2]} line={2} />{[-1, 1].map((sd) => [-1, 1].map((k) => <Ball key={sd + "" + k} p={[sd * 0.47, k * 0.08, 0]} r={0.1} color="#f3ecd6" ink={0.03} />))}</group>
);
// swaddled newborn (cartoon): cream blanket, round face, sleeping eyes; hold it with FaceGroup at a hand position
export const Bundle: React.FC<{ p: V3; h?: number; t?: number; glow?: string; helmet?: number }> = ({ p, h = 0.9, t = 0, glow, helmet = 0 }) => (
  <Billboard p={p} h={h} draw={(c, W, H) => {
    c.clearRect(0, 0, W, H); const cx = W / 2, cy = H * 0.62, S = W / 512;
    if (glow) { const g = c.createRadialGradient(cx, cy, 10, cx, cy, W * 0.5); g.addColorStop(0, glow); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(0, 0, W, H); }
    c.lineWidth = 14 * S; c.strokeStyle = INK; c.lineJoin = "round"; c.fillStyle = "#f6ecd2"; c.beginPath(); c.ellipse(cx, cy + 40 * S, 150 * S, 230 * S, 0, 0, 7); c.fill(); c.stroke();
    c.strokeStyle = "#d9c8a0"; c.lineWidth = 8 * S; c.beginPath(); c.moveTo(cx - 130 * S, cy + 20 * S); c.quadraticCurveTo(cx, cy + 120 * S, cx + 130 * S, cy - 10 * S); c.moveTo(cx - 120 * S, cy + 140 * S); c.quadraticCurveTo(cx, cy + 210 * S, cx + 110 * S, cy + 120 * S); c.stroke(); c.strokeStyle = INK;
    const fy = cy - 110 * S; c.lineWidth = 12 * S; c.fillStyle = "#f6d3b4"; c.beginPath(); c.arc(cx, fy, 92 * S, 0, 7); c.fill(); c.stroke();
    c.fillStyle = "#f6ecd2"; c.beginPath(); c.arc(cx, fy - 10 * S, 112 * S, Math.PI * 1.05, Math.PI * 1.95); c.lineTo(cx + 92 * S, fy - 40 * S); c.quadraticCurveTo(cx, fy - 100 * S, cx - 92 * S, fy - 40 * S); c.closePath(); c.fill(); c.stroke();
    c.lineWidth = 9 * S; for (const sd of [-1, 1]) { c.beginPath(); c.arc(cx + sd * 34 * S, fy + 4 * S, 16 * S, 0.2, Math.PI - 0.2); c.stroke(); }
    c.fillStyle = "#ff9aa8"; for (const sd of [-1, 1]) { c.beginPath(); c.arc(cx + sd * 56 * S, fy + 30 * S, 14 * S, 0, 7); c.fill(); }
    c.beginPath(); c.arc(cx, fy + 40 * S, 12 * S, 0.1, Math.PI - 0.1); c.stroke();
    if (helmet > 0) { c.save(); c.translate(cx, fy - 70 * S); c.scale(helmet, helmet); c.fillStyle = "#d63a2a"; c.lineWidth = 10 * S; c.beginPath(); c.ellipse(0, -70 * S, 120 * S, 40 * S, 0, Math.PI, 0); c.fill(); c.stroke(); c.fillStyle = "#d9a441"; c.beginPath(); c.arc(0, 10 * S, 100 * S, Math.PI, 0); c.closePath(); c.fill(); c.stroke(); c.restore(); }
    void t;
  }} />
);
export const Shield: React.FC<{ p: V3; r?: number; rot?: V3 }> = ({ p, r = 0.8, rot = [0, 0, 0] }) => (
  <group position={p} rotation={rot}><Cyl p={[0, 0, 0]} rt={r} h={0.12} color="#d9a441" rot={[Math.PI / 2, 0, 0]} line={3} />
    <CanvasPlane p={[0, 0, 0.07]} s={[r * 1.7, r * 1.7]} px={[128, 128]} draw={(c, W, H) => { c.clearRect(0, 0, W, H); c.fillStyle = "#c8302f"; c.beginPath(); c.arc(W / 2, H / 2, W * 0.42, 0, 7); c.fill(); c.strokeStyle = "#ffe08a"; c.lineWidth = 14; c.beginPath(); c.moveTo(W * 0.3, H * 0.75); c.lineTo(W / 2, H * 0.25); c.lineTo(W * 0.7, H * 0.75); c.stroke(); }} /></group>
);
export const Spear: React.FC<{ p: V3; h?: number; rot?: V3 }> = ({ p, h = 4.2, rot = [0, 0, 0] }) => (
  <group position={p} rotation={rot}><Cyl p={[0, h / 2, 0]} rt={0.05} h={h} color="#8a5a32" line={1} /><Prism p={[0, h, 0]} rt={0.001} rb={0.14} h={0.5} color="#c9ccd2" line={2} /></group>
);
export const Rope: React.FC<{ a: V3; b: V3 }> = ({ a, b }) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); return <Box p={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]} s={[0.06, L, 0.06]} rot={[0, 0, -Math.atan2(dx, dy)]} color="#c9a36a" line={1} />; };
export const Magnifier: React.FC<{ p: V3; s?: number; rot?: number }> = ({ p, s = 1, rot = 0 }) => (
  <group position={p} scale={s} rotation={[0, 0, rot]}><Cyl p={[0, 0, 0]} rt={0.36} h={0.08} color="#5a3a1e" rot={[Math.PI / 2, 0, 0]} line={2} /><CanvasPlane p={[0, 0, 0.05]} s={[0.6, 0.6]} px={[64, 64]} draw={(c, W, H) => { c.clearRect(0, 0, W, H); c.fillStyle = "rgba(190,230,255,.75)"; c.beginPath(); c.arc(W / 2, H / 2, W * 0.46, 0, 7); c.fill(); }} /><Box p={[0, -0.6, 0]} s={[0.1, 0.55, 0.08]} color="#5a3a1e" line={1} /></group>
);
export const PosterBoard: React.FC<{ p: V3; items: { text: string; k: number }[]; rotY?: number }> = ({ p, items, rotY = 0 }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    {[-2.4, 2.4].map((x) => <Box key={x} p={[x, 1.8, 0]} s={[0.2, 3.6, 0.2]} color="#7a5a32" line={2} />)}
    <Box p={[0, 2.6, -0.05]} s={[5.0, 2.6, 0.12]} color="#a8733a" line={3} />
    {items.map((it, i) => <group key={i} position={[-1.6 + i * 1.6, 2.6, 0.05]} scale={[it.k + 0.001, it.k + 0.001, 1]} rotation={[0, 0, (i - 1) * 0.06]}>
      <CanvasPlane p={[0, 0, 0]} s={[1.45, 2.1]} px={[145, 210]} draw={(c, W, H) => { c.fillStyle = "#f3e2b8"; c.fillRect(0, 0, W, H); c.strokeStyle = INK; c.lineWidth = 6; c.strokeRect(3, 3, W - 6, H - 6); c.fillStyle = "#3a2412"; c.beginPath(); c.arc(W / 2, H * 0.36, 30, 0, 7); c.fill(); c.fillRect(W / 2 - 34, H * 0.48, 68, 40); c.fillStyle = "#c8302f"; c.font = `900 ${it.text.length > 9 ? 17 : 22}px Inter, Arial`; c.textAlign = "center"; c.textBaseline = "middle"; it.text.split("\n").forEach((l, j) => c.fillText(l, W / 2, H * 0.12 + j * 22 + (j ? 150 : 0))); }} />
    </group>)}
  </group>
);
export const Bowl: React.FC<{ p: V3 }> = ({ p }) => <group position={p}><Cyl p={[0, 0.12, 0]} rt={0.3} rb={0.18} h={0.24} color="#c2552b" line={2} /><Cyl p={[0, 0.235, 0]} rt={0.25} h={0.01} color="#3a1a0a" line={0.5} /></group>;
export const Stamp: React.FC<{ p: V3; text: string; k: number; s?: [number, number]; color?: string; rot?: V3 }> = ({ p, text, k, s = [5, 1.8], color = "#e5233a", rot = [0, 0, -0.12] }) => k <= 0 ? null : (
  <group position={p} rotation={rot} scale={[1 + (1 - k) * 0.6, 1 + (1 - k) * 0.6, 1]}>
    <CanvasPlane p={[0, 0, 0]} s={s} px={[Math.round(s[0] * 100), Math.round(s[1] * 100)]} face draw={(c, W, H) => { c.clearRect(0, 0, W, H); c.globalAlpha = Math.min(1, k * 1.5); c.strokeStyle = color; c.lineWidth = 14; c.strokeRect(10, 10, W - 20, H - 20); c.fillStyle = color; c.font = `900 ${Math.round(H * 0.62)}px Inter, Arial`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(text, W / 2, H / 2 + 6); }} />
  </group>
);
export const Qmark: React.FC<{ p: V3; s?: number; t?: number; color?: string }> = ({ p, s = 1, t = 0, color = "#ffd24a" }) => (
  <CanvasPlane p={[p[0], p[1] + Math.sin(t * 2) * 0.1, p[2]]} s={[1.6 * s, 2.2 * s]} px={[160, 220]} face draw={(c, W, H) => { c.clearRect(0, 0, W, H); c.font = "900 210px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.lineWidth = 16; c.strokeStyle = INK; c.strokeText("?", W / 2, H / 2 + 10); c.fillStyle = color; c.fillText("?", W / 2, H / 2 + 10); }} />
);
