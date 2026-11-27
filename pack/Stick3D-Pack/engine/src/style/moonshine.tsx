// Moonshine / Prohibition props (v8): CowShoe (carved hoof shoe), Still, Jug, Barrel, Print (boot / hoof decal), Book, Newspaper, Studio.
import React from "react";
import { Box, Cyl, Ball, CanvasPlane, INK } from "./toon";
import { V3, clamp } from "./kit";
import { Glow } from "./props";

const WOOD = "#9a6434", WOOD_D = "#7a4a22", METAL = "#c7ccd6", LEATHER = "#4a2a18", STRAP = "#6a3a1a";

/* Carved wooden cow hoof nailed to a metal strip and strapped under a boot. Length ~1.2 along x, sole at y=0.
   nails: 0..1 (nail heads pop in one by one), strap: 0..1 (straps visible), boot: show the boot on top */
export const CowShoe: React.FC<{ p: V3; s?: number; rot?: V3; nails?: number; strap?: number; boot?: boolean }> = ({ p, s = 1, rot = [0, 0, 0], nails = 1, strap = 1, boot = true }) => (
  <group position={p} rotation={rot} scale={s}>
    {/* cloven hoof: two toes at the front, heel block at the back */}
    {[-0.15, 0.15].map((z) => <Cyl key={z} p={[0.28, 0.17, z]} rt={0.16} rb={0.21} h={0.34} color={WOOD} line={3} />)}
    {[-0.15, 0.15].map((z) => <Cyl key={z} p={[-0.28, 0.17, z]} rt={0.18} rb={0.2} h={0.34} color={WOOD_D} line={3} />)}
    <Box p={[0.0, 0.17, 0]} s={[0.56, 0.34, 0.6]} color={WOOD} line={3} />
    <Box p={[0.3, 0.17, 0]} s={[0.5, 0.36, 0.04]} color="#2a160a" line={1} />
    {/* metal strip */}
    <Box p={[0.0, 0.36, 0]} s={[0.98, 0.04, 0.42]} color={METAL} line={3} />
    {[-0.42, -0.1, 0.22, 0.48].map((x, i) => { const k = clamp(nails * 4 - i); return k > 0 ? <Cyl key={i} p={[x, 0.36, 0.31]} rt={0.04 * k} h={0.05} color="#8a8f9c" rot={[Math.PI / 2, 0, 0]} line={1} /> : null; })}
    {boot ? <>
      <Box p={[0.0, 0.5, 0]} s={[1.05, 0.26, 0.5]} color={LEATHER} line={3} />
      <Ball p={[0.5, 0.52, 0]} r={0.25} s={[1, 0.55, 1]} color={LEATHER} />
      <Box p={[-0.28, 0.92, 0]} s={[0.5, 0.62, 0.46]} color={LEATHER} line={3} />
      <Box p={[0.18, 0.66, 0]} s={[0.42, 0.06, 0.4]} color="#2a160a" line={1} />
    </> : null}
    {strap > 0 ? [0.2, -0.3].map((x) => <React.Fragment key={x}>{[-0.31, 0.31].map((z) => <Box key={z} p={[x, 0.38 + 0.2 * strap, z]} s={[0.1, 0.4 * strap + 0.01, 0.05]} color={STRAP} line={2} />)}
      {boot ? <Box p={[x, 0.62, 0]} s={[0.1, 0.06, 0.64]} color={STRAP} line={2} /> : <Box p={[x, 0.36 + 0.4 * strap, 0]} s={[0.1, 0.05, 0.66]} color={STRAP} line={2} />}</React.Fragment>) : null}
  </group>
);

/* copper pot still: pot over a fire, dome, pipe to a wooden "worm" barrel with a tap */
export const Still: React.FC<{ p: V3; t: number; s?: number; fire?: number }> = ({ p, t, s = 1, fire = 1 }) => (
  <group position={p} scale={s}>
    {[0, 1, 2, 3, 4].map((i) => <Box key={i} p={[Math.cos(i * 1.3) * 0.5, 0.15, Math.sin(i * 1.3) * 0.45]} s={[0.9, 0.18, 0.18]} rot={[0, i * 1.3, 0]} color="#5a3418" line={2} />)}
    {[[-0.7, 0], [0.7, 0], [0, 0.7], [0, -0.7]].map(([x, z], i) => <Box key={i} p={[x, 0.45, z]} s={[0.3, 0.9, 0.3]} color="#8a8478" line={2} />)}
    <Cyl p={[0, 1.45, 0]} rt={0.95} rb={0.85} h={1.3} color="#d2783a" line={4} />
    <Cyl p={[0, 1.6, 0]} rt={0.97} h={0.12} color="#b05a26" line={2} />
    <Ball p={[0, 2.15, 0]} r={0.75} s={[1, 0.6, 1]} color="#e08a44" />
    <Cyl p={[0, 2.65, 0]} rt={0.16} h={0.4} color="#d2783a" line={2} />
    <Cyl p={[0.95, 2.75, 0]} rt={0.08} h={1.9} color="#d2783a" rot={[0, 0, Math.PI / 2 - 0.12]} line={2} />
    <Cyl p={[2.15, 1.2, 0]} rt={0.55} h={2.0} color={WOOD} line={4} />
    {[0.5, 1.9].map((y) => <Cyl key={y} p={[2.15, y, 0]} rt={0.57} h={0.1} color="#4a4a52" line={2} />)}
    <Cyl p={[2.15, 2.4, 0]} rt={0.08} h={0.5} color="#d2783a" line={2} />
    <Box p={[2.15, 0.65, 0.58]} s={[0.12, 0.12, 0.2]} color="#b8bcc6" line={2} />
    <Ball p={[0.25, 1.75, 0.82]} r={0.16} s={[1, 0.5, 0.4]} color="#ffd9a8" ink={0.02} />
    {fire > 0 ? <>
      <Glow p={[0, 0.35, 0.3]} r={1.3 + Math.sin(t * 9) * 0.08} color="rgba(255,140,40,1)" o={0.85 * fire} />
      <Glow p={[0, 0.3, 0.4]} r={0.6 + Math.sin(t * 13) * 0.06} color="rgba(255,230,120,1)" o={0.9 * fire} />
    </> : null}
    {/* steam puffs rising from the dome */}
    {[0, 1, 2, 3].map((i) => { const u = (t * 0.45 + i / 4) % 1; return <Glow key={i} p={[Math.sin(i * 2 + t) * 0.2, 2.9 + u * 2.2, 0]} r={0.35 + u * 0.5} color="rgba(255,255,255,1)" o={0.55 * (1 - u)} />; })}
  </group>
);

export const Jug: React.FC<{ p: V3; s?: number; rotY?: number }> = ({ p, s = 1, rotY = 0 }) => (
  <group position={p} scale={s} rotation={[0, rotY, 0]}>
    <Cyl p={[0, 0.35, 0]} rt={0.32} rb={0.34} h={0.7} color="#e9dcc0" line={3} />
    <Ball p={[0, 0.72, 0]} r={0.32} s={[1, 0.5, 1]} color="#8a5a32" />
    <Cyl p={[0, 0.9, 0]} rt={0.1} h={0.2} color="#8a5a32" line={2} />
    <Box p={[0.22, 0.86, 0]} s={[0.2, 0.06, 0.06]} color="#8a5a32" line={1} />
    <CanvasPlane p={[0, 0.35, 0.345]} s={[0.4, 0.28]} px={[80, 56]} draw={(c, W, H) => { c.clearRect(0, 0, W, H); c.fillStyle = INK; c.font = "900 40px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("XXX", W / 2, H / 2 + 2); }} />
  </group>
);

export const Barrel: React.FC<{ p: V3; s?: number; side?: boolean }> = ({ p, s = 1, side }) => (
  <group position={p} scale={s} rotation={side ? [Math.PI / 2, 0, 0.3] : [0, 0, 0]}>
    <Cyl p={[0, 0.6, 0]} rt={0.48} rb={0.48} h={1.2} color={WOOD_D} line={3} />
    <Cyl p={[0, 0.6, 0]} rt={0.53} h={0.5} color={WOOD} line={2} />
    {[0.15, 1.05].map((y) => <Cyl key={y} p={[0, y, 0]} rt={0.5} h={0.08} color="#4a4a52" line={2} />)}
  </group>
);

/* footprint decal lying on the ground: boot (human) or cloven hoof (cow). glow 0..1 lights it up yellow */
export const Print: React.FC<{ p: V3; kind: "boot" | "hoof"; rotY?: number; s?: number; glow?: number; k?: number }> = ({ p, kind, rotY = 0, s = 1, glow = 0, k = 1 }) => k <= 0 ? null : (
  <group position={[p[0], p[1] + 0.02, p[2]]} rotation={[0, rotY, 0]} scale={s * (0.6 + 0.4 * k)}>
    <CanvasPlane p={[0, 0, 0]} rot={[-Math.PI / 2, 0, 0]} s={[0.6, 0.9]} px={[96, 144]} draw={(c, W, H) => {
      c.clearRect(0, 0, W, H); const col = glow > 0.05 ? `rgba(255,${Math.round(200 + 30 * glow)},60,${0.55 + 0.45 * glow})` : "rgba(48,24,10,.92)"; c.fillStyle = col;
      if (kind === "boot") { c.beginPath(); c.ellipse(W / 2, H * 0.32, W * 0.3, H * 0.24, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(W / 2, H * 0.78, W * 0.22, H * 0.15, 0, 0, 7); c.fill(); }
      else { for (const d of [-1, 1]) { c.beginPath(); c.moveTo(W / 2 + d * 4, H * 0.18); c.quadraticCurveTo(W / 2 + d * W * 0.5, H * 0.2, W / 2 + d * W * 0.36, H * 0.72); c.quadraticCurveTo(W / 2 + d * W * 0.2, H * 0.82, W / 2 + d * 4, H * 0.7); c.closePath(); c.fill(); } }
    }} />
    {glow > 0.05 ? <Glow p={[0, 0.15, 0]} r={0.7} color="rgba(255,220,90,1)" o={0.6 * glow} /> : null}
  </group>
);

/* standing open book (cover canvas faces +z). open 0..1 */
export const Book: React.FC<{ p: V3; s?: number; open?: number; title: string; sub?: string; rotY?: number }> = ({ p, s = 1, open = 1, title, sub, rotY = 0 }) => (
  <group position={p} scale={s} rotation={[0, rotY, 0]}>
    <Box p={[0, 0.06, 0]} s={[3.4, 0.12, 1.4]} color="#5a3418" line={3} />
    <group position={[0, 0.12, 0]} rotation={[-0.25 - 0.4 * (1 - open), 0, 0]}>
      <Box p={[-0.82, 1.15, 0]} s={[1.6, 2.3, 0.12]} color="#7a1e1e" line={3} rot={[0, 0.35 * open, 0]} />
      <Box p={[0.82, 1.15, 0]} s={[1.6, 2.3, 0.12]} color="#7a1e1e" line={3} rot={[0, -0.35 * open, 0]} />
      <CanvasPlane p={[0, 1.15, 0.2]} s={[2.9, 2.1]} px={[580, 420]} draw={(c, W, H) => {
        c.fillStyle = "#f6e7bd"; c.fillRect(0, 0, W, H); c.strokeStyle = INK; c.lineWidth = 8; c.strokeRect(4, 4, W - 8, H - 8); c.beginPath(); c.moveTo(W / 2, 8); c.lineTo(W / 2, H - 8); c.lineWidth = 4; c.stroke();
        c.fillStyle = "#7a1e1e"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = "900 54px Inter, Arial"; const ws = title.split(" "); ws.forEach((w, i) => c.fillText(w, W / 2, H * 0.3 + i * 62));
        if (sub) { c.fillStyle = INK; c.font = "800 26px Inter, Arial"; c.fillText(sub, W / 2, H * 0.3 + ws.length * 62 + 20); }
        // little deerstalker + pipe silhouette
        c.fillStyle = INK; const x = W / 2, y = H * 0.82; c.beginPath(); c.ellipse(x, y, 46, 22, 0, Math.PI, 0); c.fill(); c.fillRect(x - 70, y - 4, 140, 10); c.beginPath(); c.ellipse(x + 80, y + 18, 14, 10, 0, 0, 7); c.fill(); c.lineWidth = 6; c.beginPath(); c.moveTo(x + 70, y + 12); c.quadraticCurveTo(x + 40, y + 30, x + 20, y + 20); c.stroke();
      }} />
    </group>
  </group>
);

/* seamless teal photo studio (the hook look): floor + soft back glow */
export const Studio: React.FC<{ floor?: string }> = ({ floor = "#63b9cc" }) => (<>
  <Box p={[0, -0.1, 0]} s={[90, 0.2, 90]} color={floor} line={0.001} />
  <Glow p={[0, 3, -12]} r={14} color="rgba(255,255,255,1)" o={0.35} />
</>);
