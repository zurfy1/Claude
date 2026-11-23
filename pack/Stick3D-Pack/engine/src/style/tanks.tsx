// WW2 tank-yard props (v6): T34, Tiger, BrickFactory, Garage, Fence, Gantry, PowerPole, Field, Rain, Snow, Tree, PocketWatch, Gear, TapeMeasure, EngineBlock, Counter.
// Tanks face +x. Wheels spin about z (spin = distance / wheel radius). Logged in rules/ACTION-LIBRARY.md.
import React from "react";
import { Box, Cyl, Ball, CanvasPlane, INK } from "./toon";
import { V3 } from "./kit";
import { Extrude } from "./extra";
import { Glow } from "./props";

const T34_HULL: [number, number][] = [[-2.6, 0.55], [-2.6, 1.3], [-2.25, 1.5], [1.5, 1.5], [2.75, 0.8], [2.55, 0.5]];
export const T34: React.FC<{ p: V3; rotY?: number; color?: string; spin?: number; turretYaw?: number; num?: string; noTurret?: boolean; noBarrel?: boolean; wheelsOff?: number; smoke?: number; t?: number; s?: number; sink?: number; snow?: boolean }> = ({ p, rotY = 0, color = "#4f7a3a", spin = 0, turretYaw = 0, num = "3", noTurret, noBarrel, wheelsOff = 0, smoke = 0, t = 0, s = 1, sink = 0, snow }) => {
  const dark = "#2f3a26";
  return (
    <group position={[p[0], p[1] - sink, p[2]]} rotation={[0, rotY, 0]} scale={s}>
      <Extrude pts={T34_HULL} depth={2.1} color={color} line={3} />
      {[-1, 1].map((sd) => <React.Fragment key={sd}>
        <Box p={[0, 0.5, sd * 1.2]} s={[5.3, 0.86, 0.5]} color={dark} line={3} />
        <Box p={[0, 1.0, sd * 1.25]} s={[5.4, 0.07, 0.62]} color={color} line={2} />
        {[-2.0, -1.0, 0, 1.0, 2.0].map((x, i) => i < 5 - wheelsOff ? <group key={x} position={[x, 0.46, sd * 1.5]} rotation={[0, 0, -spin]}>
          <Cyl p={[0, 0, 0]} rt={0.4} h={0.16} color={color} rot={[Math.PI / 2, 0, 0]} line={2} /><Box p={[0, 0, sd * 0.09]} s={[0.56, 0.08, 0.02]} color={dark} line={1} /><Cyl p={[0, 0, sd * 0.09]} rt={0.12} h={0.04} color="#2a2a22" rot={[Math.PI / 2, 0, 0]} line={1} />
        </group> : null)}
      </React.Fragment>)}
      <Box p={[-2.45, 1.25, 0.6]} s={[0.14, 0.4, 0.5]} color="#2a2a22" line={2} /><Box p={[-2.45, 1.25, -0.6]} s={[0.14, 0.4, 0.5]} color="#2a2a22" line={2} />
      {snow ? <Box p={[-0.3, 1.53, 0]} s={[3.4, 0.06, 1.9]} color="#f4f8ff" line={1} /> : null}
      {!noTurret ? <group position={[-0.25, 1.5, 0]} rotation={[0, turretYaw, 0]}>
        <Extrude pts={[[-1.05, 0], [1.0, 0], [0.8, 0.74], [-0.9, 0.78]]} depth={1.7} color={color} line={3} />
        <Cyl p={[-0.35, 0.86, 0.3]} rt={0.26} h={0.18} color={color} line={2} />
        {!noBarrel ? <><Cyl p={[2.05, 0.38, 0]} rt={0.075} h={2.3} color={color} rot={[0, 0, -Math.PI / 2]} line={2} /><Box p={[1.05, 0.38, 0]} s={[0.3, 0.42, 0.5]} color={color} line={2} /></> : null}
        <CanvasPlane p={[0, 0.38, 0.86]} s={[0.7, 0.5]} px={[70, 50]} draw={(c, W, H) => { c.clearRect(0, 0, W, H); c.fillStyle = "#fff"; c.font = "900 44px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(num, W / 2, H / 2 + 2); }} />
      </group> : null}
      {smoke > 0 ? [0, 1, 2].map((k) => { const u = ((t * 0.5 + k / 3) % 1); return <Glow key={k} p={[-0.6 + u * 0.4, 2.0 + u * 2.4, 0]} r={0.6 + u * 1.2} color="rgba(70,70,70,1)" o={smoke * 0.55 * (1 - u)} />; }) : null}
    </group>
  );
};

export const Tiger: React.FC<{ p: V3; rotY?: number; color?: string; spin?: number; turretYaw?: number; pitch?: number; rings?: number; sink?: number; ice?: number; crack?: number; t?: number; s?: number; mud?: number; snow?: boolean }> = ({ p, rotY = 0, color = "#c4a35c", spin = 0, turretYaw = 0, pitch = 0, rings = 0, sink = 0, ice = 0, crack = 0, t = 0, s = 1, mud = 0, snow }) => {
  const dark = "#3a3426", wheel = ice > 0.5 ? "#cfe6f5" : color;
  return (
    <group position={[p[0], p[1] - sink, p[2]]} rotation={[0, rotY, 0]} scale={s}>
      <Box p={[0, 1.25, 0]} s={[5.8, 1.3, 2.3]} color={color} />
      <Extrude pts={[[2.9, 0.6], [2.9, 1.9], [3.25, 1.9], [3.05, 0.6]]} depth={2.3} color={color} line={3} />
      <Box p={[0, 1.92, 0]} s={[5.9, 0.08, 3.5]} color={color} line={3} />
      {[-1, 1].map((sd) => <React.Fragment key={sd}>
        <Box p={[0, 0.62, sd * 1.4]} s={[5.8, 1.05, 0.55]} color={dark} line={3} />
        {[0, 1].map((row) => [-2.3, -1.45, -0.6, 0.25, 1.1, 1.95].map((x, i) => <group key={row + "-" + i} position={[x + (row ? 0.42 : 0), 0.6, sd * (1.62 + (row ? 0 : 0.12))]} rotation={[0, 0, -spin]}>
          <Cyl p={[0, 0, 0]} rt={0.46} h={0.12} color={row ? wheel : wheel} rot={[Math.PI / 2, 0, 0]} line={2} /><Cyl p={[0, 0, sd * 0.07]} rt={0.14} h={0.04} color="#2a2a22" rot={[Math.PI / 2, 0, 0]} line={1} /><Box p={[0, 0, sd * 0.07]} s={[0.7, 0.07, 0.02]} color={dark} line={1} />
        </group>))}
      </React.Fragment>)}
      {mud > 0 ? <Box p={[0, 0.45, 0]} s={[6.0, 0.9 * mud, 3.6]} color="#5a3a1e" line={2} /> : null}
      {ice > 0 ? [-1, 1].map((sd) => <Box key={sd} p={[0, 0.25, sd * 1.75]} s={[5.8, 0.42 * ice, 0.16]} color="#e8f6ff" line={2} />) : null}
      {snow ? <Box p={[-1.2, 1.97, 0]} s={[2.6, 0.06, 2.2]} color="#f4f8ff" line={1} /> : null}
      <group position={[-0.2, 1.92, 0]} rotation={[0, turretYaw, 0]}>
        <Box p={[0, 0.52, 0]} s={[2.9, 1.05, 2.3]} color={color} />
        <Box p={[1.62, 0.5, 0]} s={[0.36, 0.86, 1.2]} color={color} line={3} />
        <Cyl p={[-0.6, 1.16, 0.6]} rt={0.36} h={0.28} color={color} line={2} />
        <CanvasPlane p={[-0.2, 0.55, 1.16]} s={[0.9, 0.6]} px={[90, 60]} draw={(c, W, H) => { c.clearRect(0, 0, W, H); c.strokeStyle = "#fff"; c.lineWidth = 4; c.font = "900 44px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = INK; c.strokeText("13", W / 2, H / 2 + 2); c.fillText("13", W / 2, H / 2 + 2); }} />
        <group position={[1.8, 0.5, 0]} rotation={[0, 0, pitch]}>
          <Cyl p={[2.0, 0, 0]} rt={0.09} h={4.0} color={color} rot={[0, 0, -Math.PI / 2]} line={2} />
          <Cyl p={[4.1, 0, 0]} rt={0.17} h={0.4} color={color} rot={[0, 0, -Math.PI / 2]} line={2} />
          {Array.from({ length: rings }, (_, i) => <Cyl key={i} p={[0.7 + i * 0.22, 0, 0]} rt={0.12} h={0.08} color="#ffffff" rot={[0, 0, -Math.PI / 2]} line={1} />)}
        </group>
      </group>
      {crack > 0 ? <><CanvasPlane p={[-2.92, 1.25, 0]} rot={[0, -Math.PI / 2, 0]} s={[2.2, 1.2]} px={[220, 120]} draw={(c, W, H) => { c.clearRect(0, 0, W, H); c.strokeStyle = "#ffcf3a"; c.lineWidth = 8; c.shadowColor = "#ff8a00"; c.shadowBlur = 16; c.beginPath(); c.moveTo(W * 0.5, 0); let x = W * 0.5; for (let y = 0; y < H * crack; y += 14) { x += (Math.sin(y * 1.7) * 22); c.lineTo(x, y); } c.stroke(); c.beginPath(); c.moveTo(W * 0.5, H * 0.4); c.lineTo(W * 0.5 + 60 * crack, H * 0.6); c.stroke(); }} />
        <Glow p={[-3.1, 1.3, 0]} r={1.6} color="rgba(255,170,40,1)" o={0.5 * crack} />
        {[0, 1, 2].map((k) => { const u = ((t * 0.6 + k / 3) % 1); return <Glow key={k} p={[-3.0, 1.6 + u * 2.6, 0.2]} r={0.5 + u} color="rgba(90,90,90,1)" o={0.5 * crack * (1 - u)} />; })}</> : null}
    </group>
  );
};

/* ---------- buildings & yard ---------- */
export const BrickFactory: React.FC<{ p: V3; w?: number; h?: number; d?: number; teeth?: number; rotY?: number }> = ({ p, w = 14, h = 5, d = 4, teeth = 4, rotY = 0 }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <Box p={[0, h / 2, 0]} s={[w, h, d]} color="#b5482e" />
    {Array.from({ length: teeth }, (_, i) => { const tw = w / teeth, x = -w / 2 + tw * (i + 0.5); return <Extrude key={i} pts={[[-tw / 2, 0], [tw / 2, 0], [0, tw * 0.45]]} depth={d} p={[x, h, 0]} color="#a83e26" line={3} />; })}
    <CanvasPlane p={[0, h / 2, d / 2 + 0.02]} s={[w, h]} px={[Math.round(w * 40), Math.round(h * 40)]} draw={(c, W, H) => { c.fillStyle = "#b5482e"; c.fillRect(0, 0, W, H); c.strokeStyle = "rgba(60,20,10,.55)"; c.lineWidth = 2; for (let y = 0; y < H; y += 12) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); for (let x = (y / 12) % 2 ? 0 : 14; x < W; x += 28) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 12); c.stroke(); } }
      const n = Math.max(2, Math.round(W / 110)); for (let i = 0; i < n; i++) { const x = (i + 0.5) * W / n - 26; c.fillStyle = "#e9eef5"; c.strokeStyle = "#f1e4d0"; c.lineWidth = 8; c.beginPath(); c.moveTo(x, H * 0.75); c.lineTo(x, H * 0.38); c.arc(x + 26, H * 0.38, 26, Math.PI, 0); c.lineTo(x + 52, H * 0.75); c.closePath(); c.stroke(); c.fillStyle = "#273246"; c.fill(); c.strokeStyle = "#e9eef5"; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 26, H * 0.32); c.lineTo(x + 26, H * 0.75); c.moveTo(x, H * 0.52); c.lineTo(x + 52, H * 0.52); c.stroke(); } }} />
  </group>
);
export const Garage: React.FC<{ p: V3; w?: number; h?: number; d?: number; open?: number }> = ({ p, w = 10, h = 6, d = 8, open = 1 }) => (
  <group position={p}>
    <Box p={[0, h / 2, -d / 2]} s={[w, h, 0.3]} color="#eef0f2" />
    <Box p={[-w / 2, h / 2, 0]} s={[0.3, h, d]} color="#e4e7ea" /><Box p={[w / 2, h / 2, 0]} s={[0.3, h, d]} color="#e4e7ea" />
    <Extrude pts={[[-w / 2 - 0.4, 0], [w / 2 + 0.4, 0], [0, 2.2]]} depth={d + 0.4} p={[0, h, 0]} color="#58606a" line={3} />
    <CanvasPlane p={[0, h + 0.8, d / 2 + 0.25]} s={[w * 0.7, 1.4]} px={[400, 80]} draw={(c, W, H) => { c.fillStyle = "#eef0f2"; c.fillRect(0, 0, W, H); c.fillStyle = "#273246"; c.beginPath(); c.arc(W / 2, H, 34, Math.PI, 0); c.fill(); }} />
    {open < 1 ? <Box p={[0, h / 2, d / 2]} s={[w, h, 0.3]} color="#eef0f2" /> : null}
  </group>
);
export const Fence: React.FC<{ p: V3; L: number; rotY?: number; h?: number; color?: string }> = ({ p, L, rotY = 0, h = 1.6, color = "#b07a42" }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    {Array.from({ length: Math.round(L / 0.45) }, (_, i) => <Box key={i} p={[-L / 2 + i * 0.45, h / 2, 0]} s={[0.3, h + (i % 2) * 0.12, 0.08]} color={color} line={2} />)}
    <Box p={[0, h * 0.75, -0.08]} s={[L, 0.14, 0.06]} color="#8a5a2c" line={2} /><Box p={[0, h * 0.25, -0.08]} s={[L, 0.14, 0.06]} color="#8a5a2c" line={2} />
  </group>
);
export const Gantry: React.FC<{ p: V3; w?: number; h?: number; hookY?: number }> = ({ p, w = 6, h = 6, hookY = 3 }) => (
  <group position={p}>
    {[-1, 1].map((s) => <Box key={s} p={[s * w / 2, h / 2, 0]} s={[0.3, h, 0.3]} color="#2f3542" line={3} />)}
    <Box p={[0, h, 0]} s={[w + 0.6, 0.4, 0.4]} color="#2f3542" line={3} />
    <Box p={[0, (h + hookY) / 2, 0]} s={[0.05, h - hookY, 0.05]} color="#8a8f99" line={1} /><Box p={[0, hookY, 0]} s={[0.3, 0.3, 0.3]} color="#ffc23a" line={2} />
  </group>
);
export const PowerPole: React.FC<{ p: V3; h?: number }> = ({ p, h = 7 }) => (
  <group position={p}><Cyl p={[0, h / 2, 0]} rt={0.12} rb={0.16} h={h} color="#6b4a2e" line={2} /><Box p={[0, h - 0.5, 0]} s={[2.2, 0.14, 0.14]} color="#6b4a2e" line={2} />
    {[-0.9, 0, 0.9].map((x) => <Cyl key={x} p={[x, h - 0.3, 0]} rt={0.06} h={0.25} color="#e6e6ea" line={1} />)}</group>
);
export const Tree: React.FC<{ p: V3; s?: number; color?: string; t?: number; bare?: boolean }> = ({ p, s = 1, color = "#3f9a3a", t = 0, bare }) => (
  <group position={p} scale={s}><Cyl p={[0, 1.2, 0]} rt={0.16} rb={0.24} h={2.4} color="#6b4a2e" line={2} />
    {bare ? [[-0.5, 2.6], [0.5, 2.8], [0, 3.1]].map(([x, y], i) => <Box key={i} p={[x * 0.6, y, 0]} s={[0.07, 1.0, 0.07]} rot={[0, 0, x * -0.8]} color="#6b4a2e" line={1} />)
      : <><Ball p={[0, 3.0 + Math.sin(t * 1.2) * 0.03, 0]} r={1.15} color={color} ink={0.05} /><Ball p={[0.7, 2.5, 0.2]} r={0.8} color={color} ink={0.05} /><Ball p={[-0.7, 2.6, 0.1]} r={0.8} color={color} ink={0.05} /></>}
  </group>
);
// falling particles in a box around c (rain = streaks, snow = flakes)
export const Weather: React.FC<{ t: number; kind: "rain" | "snow"; c: V3; area?: V3; n?: number }> = ({ t, kind, c, area = [14, 9, 10], n = 90 }) => (
  <>{Array.from({ length: n }, (_, i) => {
    const rx = Math.sin(i * 12.9898) * 43758.5453, rz = Math.sin(i * 78.233) * 12543.123, ry = Math.sin(i * 39.425) * 9871.77;
    const fx = rx - Math.floor(rx), fz = rz - Math.floor(rz), fy = ry - Math.floor(ry);
    const sp = kind === "rain" ? 1.6 : 0.16, y = ((fy - t * sp) % 1 + 1) % 1;
    const x = c[0] + (fx - 0.5) * area[0] + (kind === "snow" ? Math.sin(t * 1.3 + i) * 0.3 : 0), z = c[2] + (fz - 0.5) * area[2], yy = c[1] + y * area[1];
    return kind === "rain" ? <Box key={i} p={[x, yy, z]} s={[0.025, 0.55, 0.025]} rot={[0, 0, 0.12]} color="#c9dcf0" line={1} /> : <Ball key={i} p={[x, yy, z]} r={0.06} color="#ffffff" ink={0.0} />;
  })}</>
);
export const Gear: React.FC<{ p: V3; r: number; teeth?: number; rot?: number; color?: string; rotX?: number }> = ({ p, r, teeth = 10, rot = 0, color = "#d9a92e", rotX = 0 }) => {
  const pts: [number, number][] = []; for (let i = 0; i < teeth * 2; i++) { const a = (i / (teeth * 2)) * Math.PI * 2, rr = i % 2 ? r : r * 1.18; pts.push([Math.cos(a - 0.12) * rr, Math.sin(a - 0.12) * rr], [Math.cos(a + 0.12) * rr, Math.sin(a + 0.12) * rr]); }
  return <group position={p} rotation={[rotX, 0, rot]}><Extrude pts={pts} depth={0.12} color={color} line={2} /></group>;
};
export const PocketWatch: React.FC<{ p: V3; s?: number; open?: number; t: number; rotY?: number }> = ({ p, s = 1, open = 1, t, rotY = 0 }) => (
  <group position={p} scale={s} rotation={[0, rotY, 0]}>
    <Cyl p={[0, 0, 0]} rt={1.2} h={0.25} color="#e0b63a" rot={[Math.PI / 2, 0, 0]} />
    <CanvasPlane p={[0, 0, 0.14]} s={[2.1, 2.1]} px={[256, 256]} draw={(c, W, H) => { c.clearRect(0, 0, W, H); c.fillStyle = "#fbf6e6"; c.beginPath(); c.arc(W / 2, H / 2, W / 2 - 4, 0, 7); c.fill(); c.strokeStyle = INK; c.lineWidth = 6; c.stroke(); c.fillStyle = INK; c.font = "700 26px Georgia"; c.textAlign = "center"; c.textBaseline = "middle"; const R = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"]; R.forEach((r, i) => { const a = i / 12 * Math.PI * 2 - Math.PI / 2; c.fillText(r, W / 2 + Math.cos(a) * 96, H / 2 + Math.sin(a) * 96); });
      c.strokeStyle = "#1d3fa0"; c.lineWidth = 8; const hA = t * 0.5 - Math.PI / 2, mA = t * 6 - Math.PI / 2; c.beginPath(); c.moveTo(W / 2, H / 2); c.lineTo(W / 2 + Math.cos(hA) * 52, H / 2 + Math.sin(hA) * 52); c.moveTo(W / 2, H / 2); c.lineTo(W / 2 + Math.cos(mA) * 82, H / 2 + Math.sin(mA) * 82); c.stroke(); }} />
    <Cyl p={[0, 1.35, 0]} rt={0.2} h={0.3} color="#e0b63a" /><Cyl p={[0, 1.6, 0]} rt={0.28} h={0.1} color="#e0b63a" rot={[Math.PI / 2, 0, 0]} />
    <group position={[-1.2, 0, 0]} rotation={[0, -open * 1.9, 0]}><Cyl p={[1.2, 0, -0.05]} rt={1.22} h={0.12} color="#d4a420" rot={[Math.PI / 2, 0, 0]} /></group>
    {open > 0.3 ? <><Gear p={[1.9, -0.6, 0]} r={0.55} rot={t * 2} /><Gear p={[2.5, 0.35, 0]} r={0.38} teeth={8} rot={-t * 2.9} color="#c98f12" /><Gear p={[1.6, 0.75, 0.1]} r={0.3} teeth={7} rot={t * 3.6} color="#e8c24a" /></> : null}
  </group>
);
export const TapeMeasure: React.FC<{ a: V3; b: V3; k: number; label: string }> = ({ a, b, k, label }) => {
  const dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz) * k, ang = Math.atan2(-dz, dx);
  return (<group position={a} rotation={[0, ang, 0]}>
    <Box p={[0, 0.35, 0]} s={[0.9, 0.7, 0.9]} color="#ffc928" line={3} />
    {L > 0.05 ? <CanvasPlane p={[L / 2, 0.06, 0]} rot={[-Math.PI / 2, 0, 0]} s={[L, 0.6]} px={[Math.max(8, Math.round(L * 40)), 24]} draw={(c, W, H) => { c.fillStyle = "#ffd23a"; c.fillRect(0, 0, W, H); c.strokeStyle = INK; c.lineWidth = 2; for (let x = 0; x < W; x += 10) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, x % 40 ? 7 : 14); c.stroke(); } c.strokeRect(0, 0, W, H); }} /> : null}
    {k > 0.95 ? <CanvasPlane p={[L * 0.5, 1.4, 0]} s={[2.8, 0.9]} px={[280, 90]} face draw={(c, W, H) => { c.fillStyle = "#ffd23a"; c.strokeStyle = INK; c.lineWidth = 8; c.beginPath(); c.roundRect(4, 4, W - 8, H - 8, 14); c.fill(); c.stroke(); c.fillStyle = INK; c.font = "900 54px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(label, W / 2, H / 2 + 3); }} /> : null}
  </group>);
};
export const EngineBlock: React.FC<{ p: V3; rot?: V3; s?: number; broken?: boolean; t?: number }> = ({ p, rot = [0, 0, 0], s = 1, broken, t = 0 }) => (
  <group position={p} rotation={rot} scale={s}>
    <Box p={[0, 0.4, 0]} s={[1.3, 0.8, 0.8]} color={broken ? "#5a5a5a" : "#7a8590"} />
    {[-0.4, 0, 0.4].map((x) => <Cyl key={x} p={[x, 0.95, 0]} rt={0.16} h={0.3} color={broken ? "#4a4a4a" : "#9aa3ad"} line={2} />)}
    <Cyl p={[0.75, 0.45, 0]} rt={0.28} h={0.12} color="#3a3a3a" rot={[0, 0, Math.PI / 2]} line={2} />
    {broken ? [0, 1].map((k) => { const u = ((t * 0.7 + k / 2) % 1); return <Glow key={k} p={[0, 1.1 + u * 1.5, 0]} r={0.4 + u * 0.7} color="rgba(60,60,60,1)" o={0.5 * (1 - u)} />; }) : null}
  </group>
);
export const Counter: React.FC<{ p: V3; s: [number, number]; text: string; color: string; sub?: string; rot?: V3 }> = ({ p, s, text, color, sub, rot }) => (
  <CanvasPlane p={p} s={s} rot={rot} px={[Math.round(s[0] * 90), Math.round(s[1] * 90)]} face draw={(c, W, H) => { c.clearRect(0, 0, W, H); c.fillStyle = "rgba(255,255,255,.92)"; c.strokeStyle = INK; c.lineWidth = 8; c.beginPath(); c.roundRect(4, 4, W - 8, H - 8, 18); c.fill(); c.stroke(); c.fillStyle = color; c.font = `900 ${Math.round(H * (sub ? 0.46 : 0.6))}px Inter, Arial`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(text, W / 2, H * (sub ? 0.4 : 0.52)); if (sub) { c.fillStyle = INK; c.font = `800 ${Math.round(H * 0.22)}px Inter, Arial`; c.fillText(sub, W / 2, H * 0.78); } }} />
);
