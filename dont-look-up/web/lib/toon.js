// Toon materials, ink outlines and procedural canvas textures.
import * as THREE from './three.module.js';

// 3-band toon ramp
const ramp = (() => {
  const d = new Uint8Array([120, 120, 120, 255, 195, 195, 195, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
})();

const matCache = new Map();
export function toon(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!opts.map && matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshToonMaterial({ color, gradientMap: ramp, ...opts });
  if (!opts.map) matCache.set(key, m);
  return m;
}

export const inkMat = new THREE.MeshBasicMaterial({ color: 0x0b0b12, side: THREE.BackSide });

// Inverted-hull outline: a slightly fattened back-face copy of the mesh.
export function ink(mesh, w = 0.012) {
  const g = mesh.geometry;
  if (!g.boundingSphere) g.computeBoundingSphere();
  const r = g.boundingSphere.radius || 1;
  const o = new THREE.Mesh(g, inkMat);
  const s = 1 + w / r;
  o.scale.setScalar(s);
  o.position.copy(g.boundingSphere.center).multiplyScalar(1 - s);
  o.renderOrder = -1;
  mesh.add(o);
  return mesh;
}

// Outline for boxes: scale per-axis so the border is uniform.
export function inkBox(mesh, w = 0.012) {
  const p = mesh.geometry.parameters;
  const o = new THREE.Mesh(mesh.geometry, inkMat);
  o.scale.set(1 + (2 * w) / p.width, 1 + (2 * w) / p.height, 1 + (2 * w) / p.depth);
  mesh.add(o);
  return mesh;
}

export function box(w, h, d, color, outline = 0.012, opts) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(color, opts));
  if (outline) inkBox(m, outline);
  return m;
}
export function sphere(r, color, outline = 0.01, seg = 20) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.7)), toon(color));
  if (outline) ink(m, outline);
  return m;
}
// Capsule spanning from local origin down -Y by `len` (joint-friendly).
export function limb(r, len, color, outline = 0.01) {
  const g = new THREE.CapsuleGeometry(r, Math.max(0.001, len - 2 * r), 6, 14);
  g.translate(0, -len / 2, 0);
  const m = new THREE.Mesh(g, toon(color));
  if (outline) {
    const o = new THREE.Mesh(new THREE.CapsuleGeometry(r + outline, Math.max(0.001, len - 2 * r), 6, 14).translate(0, -len / 2, 0), inkMat);
    m.add(o);
  }
  return m;
}
export function cyl(rt, rb, h, color, outline = 0.01, seg = 16) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), toon(color));
  if (outline) {
    const o = new THREE.Mesh(new THREE.CylinderGeometry(rt + outline, rb + outline, h + outline * 2, seg), inkMat);
    m.add(o);
  }
  return m;
}

// ---------- canvas textures ----------
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
export function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}

export function carpetTex() {
  return canvasTex(256, 256, (g, w, h) => {
    const r = rng(7);
    g.fillStyle = '#7a2f3a'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2500; i++) { g.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.08)' : 'rgba(255,220,200,0.06)'; g.fillRect(r() * w, r() * h, 2, 2); }
    g.strokeStyle = '#d9a441'; g.lineWidth = 4;
    g.strokeRect(16, 16, w - 32, h - 32);
    g.save(); g.translate(w / 2, h / 2); g.rotate(Math.PI / 4);
    g.strokeStyle = '#2e5a6b'; g.lineWidth = 6; g.strokeRect(-48, -48, 96, 96);
    g.fillStyle = '#d9a441'; g.fillRect(-12, -12, 24, 24); g.restore();
  }, [6, 9]);
}
export function woodTex(base = '#8a5a34') {
  return canvasTex(256, 64, (g, w, h) => {
    const r = rng(3);
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      g.strokeStyle = `rgba(40,20,5,${0.08 + r() * 0.12})`; g.lineWidth = 1 + r() * 2;
      const y = r() * h; g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.03 + i) * 3);
      g.stroke();
    }
  });
}
export function wallTex() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#cfc3a6'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c4b796';
    for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 14, h);
  }, [10, 2]);
}
export function tileTex() {
  return canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#e6e2d6'; g.fillRect(0, 0, w, h);
    const r = rng(11);
    for (let i = 0; i < 300; i++) { g.fillStyle = 'rgba(90,80,60,0.18)'; g.fillRect(r() * w, r() * h, 1.5, 1.5); }
    g.strokeStyle = '#9b9585'; g.lineWidth = 3; g.strokeRect(0, 0, w, h);
  }, [16, 20]);
}
export function concreteTex() {
  return canvasTex(256, 256, (g, w, h) => {
    const r = rng(5);
    g.fillStyle = '#6f7378'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 4000; i++) { const v = r(); g.fillStyle = `rgba(${v < 0.5 ? '20,20,25' : '200,200,210'},${0.05 + r() * 0.08})`; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3); }
    g.strokeStyle = 'rgba(20,20,25,0.35)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
  }, [8, 8]);
}
export function metalTex() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#8d949c'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 64) {
      g.fillStyle = '#5c636b'; g.fillRect(0, y, w, 6);
      for (let x = 12; x < w; x += 32) { g.fillStyle = '#3b4047'; g.beginPath(); g.arc(x, y + 14, 3.5, 0, 7); g.fill(); }
    }
    const r = rng(9);
    for (let i = 0; i < 200; i++) { g.fillStyle = 'rgba(60,40,20,0.15)'; g.fillRect(r() * w, r() * h, 8, 2); }
  }, [6, 3]);
}
export function signTex(text, bg, fg, w = 512, h = 128, font = 'bold 72px "Barlow Condensed"') {
  return canvasTex(w, h, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.strokeStyle = fg; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16);
    g.fillStyle = fg; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, w / 2, h / 2 + 4);
  });
}
export const RNG = rng;
