// "DON'T LOOK UP" — shot-by-shot director. window.renderAt(t) draws the frame at time t (seconds).
import * as THREE from './lib/three.module.js';
import { buildLibrary, buildTunnel, buildBasement, uniforms } from './lib/world.js';
import { Person, Intruder, Creature, creatureFace, lerpPose } from './lib/rig.js';
import { toon, limb, sphere, cyl } from './lib/toon.js';

const Wd = 1080, Ht = 1920;
const PR = Number(new URLSearchParams(location.search).get('pr') || 1);
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(PR); renderer.setSize(Wd, Ht, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05060a);
const camera = new THREE.PerspectiveCamera(70, Wd / Ht, 0.03, 80);
scene.add(camera);

// ---------- post (barrel lens, grade, grain, vignette) ----------
const rt = new THREE.WebGLRenderTarget(Wd * PR, Ht * PR, { samples: 4, colorSpace: THREE.SRGBColorSpace });
const post = new THREE.ShaderMaterial({
  uniforms: { tD: { value: rt.texture }, uK: { value: 0.22 }, uAsp: { value: Wd / Ht }, uTime: { value: 0 }, uTint: { value: new THREE.Vector3(1, 1, 1) },
    uVig: { value: 0.45 }, uGrain: { value: 0.05 }, uAb: { value: 0.0015 }, uBright: { value: 1 }, uSat: { value: 1.12 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
  fragmentShader: `uniform sampler2D tD; uniform float uK, uAsp, uTime, uVig, uGrain, uAb, uBright, uSat; uniform vec3 uTint; varying vec2 vUv;
    vec2 lens(vec2 uv, float k){ vec2 p = uv - 0.5; p.x *= uAsp; float r2 = dot(p,p); float rc = 0.25*uAsp*uAsp + 0.25;
      p *= (1.0 + k*r2) / (1.0 + k*rc); p.x /= uAsp; return p + 0.5; }
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + uTime*7.13) * 43758.5453); }
    void main(){
      vec2 uvR = lens(vUv, uK + uAb*20.0), uvG = lens(vUv, uK), uvB = lens(vUv, uK - uAb*20.0);
      vec3 c = vec3(texture2D(tD, uvR).r, texture2D(tD, uvG).g, texture2D(tD, uvB).b);
      float l = dot(c, vec3(0.299,0.587,0.114)); c = mix(vec3(l), c, uSat);
      c *= uTint * uBright;
      vec2 q = vUv - 0.5; q.x *= uAsp * 1.25; c *= 1.0 - uVig * smoothstep(0.25, 0.85, length(q));
      c += (hash(vUv*1000.0) - 0.5) * uGrain;
      gl_FragColor = vec4(c, 1.0);
    }`,
  depthTest: false, depthWrite: false,
});
const postScene = new THREE.Scene();
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post); quad.frustumCulled = false; postScene.add(quad);
const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// ---------- lights ----------
const hemi = new THREE.HemisphereLight(0xfff1d6, 0x6b4a3a, 1.2); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0d8, 1.4); sun.position.set(-6, 9, 4); scene.add(sun);
const moon = new THREE.DirectionalLight(0x8fa8e8, 0); moon.position.set(-12, 5, -2); scene.add(moon);
const phoneLight = new THREE.PointLight(0xc8dcff, 0, 6, 1.2); camera.add(phoneLight); phoneLight.position.set(0, -0.25, -0.2);
const fill = new THREE.PointLight(0xa8bcff, 0, 5, 1.0); camera.add(fill); fill.position.set(0.3, 0.4, 0.3);

await document.fonts.load('800 72px "Barlow Condensed"'); await document.fonts.load('700 72px "Barlow Condensed"');
// ---------- world + cast ----------
const lib = buildLibrary(scene);
const TUN_O = new THREE.Vector3(60, 10, 0), BAS_O = new THREE.Vector3(120, 0, 0);
const tunnel = buildTunnel(scene, TUN_O);
const base = buildBasement(scene, BAS_O);

const dev = new Person({ skin: 0xb9794c, hair: 0x17110d, top: 0xe8792b, cuff: 0xc85e18, hood: 0xd46a20, pants: 0x34425e, shoe: 0xd23a3a, strings: true, pocket: 0xc85e18, hairStyle: 'messy' });
const jordan = new Person({ skin: 0x8e5a38, hair: 0x1c120c, top: 0xe0457b, cuff: 0xb83262, hood: 0xc93b6c, pants: 0x2a2a35, shoe: 0xf2f2f2, pocket: 0xb83262, hairStyle: 'puff', band: 0xffd23f });
scene.add(dev.root, jordan.root);
toon(0xb9794c).emissive.setHex(0x2a160c); toon(0x8e5a38).emissive.setHex(0x2a160c);
const i1 = new Intruder(scene, { keys: true }), i2 = new Intruder(scene), i3 = new Intruder(scene, { color: 0xd9b416 });
const intruders = [i1, i2, i3];
for (const i of intruders) scene.add(i.root);
const thing = new Creature(creatureFace()); scene.add(thing.root);

// POV hands (Maya) for crawling
const povHands = new THREE.Group(); camera.add(povHands);
const mkPovArm = (s) => { const g = new THREE.Group(); g.add(limb(0.07, 0.55, 0x2a9d8f, 0.012)); const h = sphere(0.075, 0xc98d62, 0.01, 14); h.scale.set(1, 0.8, 1.2); h.position.y = -0.58; g.add(h); povHands.add(g); return g; };
const povL = mkPovArm(1), povR = mkPovArm(-1);

// ---------- timeline ----------
const TL = await (await fetch('timeline.json')).json();
const RULES = {
  1: 'Do NOT turn on your flashlight.', 2: 'Do NOT answer when they call you.', 3: 'Back stairwell. Stay low. Now.',
  4: 'Book return chute. Down. GO.', 5: "Don't look up.",
};

// ---------- helpers ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const easeIn = (x) => clamp(x) ** 3, easeOut = (x) => 1 - (1 - clamp(x)) ** 3;
const mix = (a, b, t) => a + (b - a) * t;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const vmix = (a, b, t) => a.clone().lerp(b, t);
function noise1(t, s = 0) { return Math.sin(t * 1.7 + s) * 0.5 + Math.sin(t * 3.1 + s * 2.3) * 0.3 + Math.sin(t * 5.3 + s * 4.1) * 0.2; }
function setCam(pos, look, fov = 70, roll = 0, shake = 0, t = 0) {
  camera.position.copy(pos);
  if (shake) camera.position.add(V(noise1(t * 9, 1) * shake, noise1(t * 9, 2) * shake, noise1(t * 9, 3) * shake * 0.5));
  camera.up.set(0, 1, 0); camera.lookAt(look);
  camera.rotateZ(roll + (shake ? noise1(t * 7, 5) * shake * 0.6 : 0));
  camera.fov = fov; camera.updateProjectionMatrix();
}
function mouthFor(id, t) {
  const L = TL.lines.find((l) => l.id === id);
  if (!L) return 0;
  const i = Math.floor((t - L.start) * TL.fps);
  return i >= 0 && i < L.env.length ? L.env[i] : 0;
}
function speakingMouth(who, t) {
  for (const L of TL.lines) if (L.who === who && t >= L.start && t < L.start + L.dur) return mouthFor(L.id, t);
  return 0;
}
// lighting modes
let flashAmt = 0;
function lighting(mode, t) {
  const lit = mode === 'lit';
  hemi.color.setHex(lit ? 0xfff1d6 : mode === 'base' ? 0x5a6e9e : 0x8098d0);
  hemi.groundColor.setHex(lit ? 0x6b4a3a : 0x3a3048);
  hemi.intensity = lit ? 1.25 : mode === 'base' ? 1.6 : 2.1;
  fill.intensity = lit ? 0 : mode === 'base' ? 1.4 : 1.9;
  sun.intensity = lit ? 1.5 : 0;
  moon.intensity = lit ? 0 : (mode === 'base' ? 0.3 : 1.8) + flashAmt * 5;
  hemi.intensity += flashAmt * 1.5;
  for (const l of lib.lamps) { l.bulb.material.color.setHex(lit ? 0xffe2a0 : 0x2a2418); }
  for (const p of lib.ceilingPanels) p.material.color.setHex(lit ? 0xfff4da : 0x3a3f4a);
  uniforms.uFlash.value = flashAmt;
  post.uniforms.uBright.value = brightFor(mode);
  if (lit) post.uniforms.uTint.value.set(1.06, 1.0, 0.9);
  else if (mode === 'base') post.uniforms.uTint.value.set(0.85, 0.95, 1.15);
  else post.uniforms.uTint.value.set(0.95, 1.0, 1.15);
  post.uniforms.uVig.value = lit ? 0.35 : 0.5;
}
function lightningAt(t, times) {
  let f = 0;
  for (const s of times) { const d = t - s; if (d >= 0 && d < 0.9) f = Math.max(f, (d < 0.08 ? 1 : d < 0.16 ? 0.3 : d < 0.24 ? 0.85 : Math.exp(-(d - 0.24) * 7) * 0.7)); }
  return f;
}
const LIGHTNING = [2.35, 21.7, 33.2, 44.6];

// ---------- poses ----------
const P = {
  sit: { hy: 0.56, spine: 6, neck: -2, lSh: [-55, 0, 12], rSh: [-55, 0, -12], lEl: -55, rEl: -55, lHip: -90, rHip: -90, lKnee: 90, rKnee: 90 },
  lunge: { hy: 0.62, spine: 38, neck: -30, lSh: [-40, 0, 25], rSh: [-110, 0, -8], lEl: -40, rEl: -8, lHip: -80, rHip: -70, lKnee: 80, rKnee: 70 },
  fours: { hy: 0.43, spine: 84, neck: -52, head: -8, lSh: [-112, 0, 6], rSh: [-112, 0, -6], lEl: 18, rEl: 18, lHip: [4, 0, 4], rHip: [4, 0, -4], lKnee: 92, rKnee: 92 },
  hug: { hy: 0.1, spine: 40, neck: -20, lSh: [-75, 0, 25], rSh: [-75, 0, -25], lEl: -60, rEl: -60, lHip: [-125, 0, 6], rHip: [-125, 0, -6], lKnee: 140, rKnee: 140 },
};
function crawlPose(ph, amt = 1) {
  const s = Math.sin(ph) * amt;
  return lerpPose(P.fours, { ...P.fours, lSh: [-112 - 22 * s, 0, 6], rSh: [-112 + 22 * s, 0, -6], lHip: [4 + 18 * s, 0, 4], rHip: [4 - 18 * s, 0, -4], lKnee: 92 - 10 * s, rKnee: 92 + 10 * s }, 1);
}

// ---------- overlays ----------
const $ = (id) => document.getElementById(id);
const capEl = $('cap'), bannerEl = $('banner'), phoneEl = $('phone'), blackEl = $('black'), whiteEl = $('white'), glowEl = $('glow');
let capKey = '';
function captions(t) {
  let L = null;
  for (const l of TL.lines) if (t >= l.start - 0.02 && t < l.end + 0.4) L = l;
  const shown = L ? L.words.filter((w) => w.t <= t + 0.02) : [];
  const key = (L ? L.id : '') + ':' + shown.length;
  if (key !== capKey) {
    capKey = key;
    capEl.innerHTML = shown.map((w) => `<span class="${w.hl ? 'hl' : ''}">${w.w}</span>`).join('');
  }
  const spans = capEl.children;
  for (let i = 0; i < spans.length; i++) { const a = clamp((t - shown[i].t) / 0.09); spans[i].style.transform = `scale(${mix(0.55, 1, easeOut(a)) + Math.sin(a * Math.PI) * 0.12})`; }
  capEl.style.top = t > 65.2 ? '1480px' : '1010px';
  capEl.style.opacity = L && t > L.end + 0.25 ? 1 - (t - L.end - 0.25) / 0.15 : 1;
}
function phoneOverlay(n, u, dur) {
  if (!n) { phoneEl.style.transform = 'translateY(1700px)'; bannerEl.style.transform = 'translateY(-320px)'; return; }
  phoneEl.className = n === 5 ? 'r5' : '';
  phoneEl.querySelector('.rule').textContent = 'RULE ' + n;
  phoneEl.querySelector('.txt').textContent = RULES[n];
  bannerEl.querySelector('.msg').innerHTML = `<b>RULE ${n}:</b> ${RULES[n]}`;
  const inP = easeOut(u / 0.4), outP = easeIn((u - (dur - 0.25)) / 0.25);
  const buzz = u > 0.25 && u < 0.85 ? Math.sin(u * 140) * 6 : 0;
  const glitch = n === 5 && ((u * 7) % 1 < 0.08) ? (Math.sin(u * 300) * 14) : 0;
  const y = mix(1700, 0, inP) + mix(0, 1700, outP) + Math.sin(u * 2.1) * 8;
  phoneEl.style.transform = `translate(${buzz + glitch}px, ${y}px) rotate(${-4 + Math.sin(u * 1.6) * 1.2 + buzz * 0.1}deg)`;
  const b = easeOut((u - 0.25) / 0.3) - easeIn((u - (dur - 0.3)) / 0.25);
  bannerEl.style.transform = `translateY(${mix(-320, 0, clamp(b))}px)`;
}

// ---------- shots ----------
// each: [start, end, fn(u, d, t)] ; u = local time
const D2R = Math.PI / 180;
function placeDevUnderA() { dev.root.position.set(0.05, 0, 0.42); dev.root.rotation.set(0, 0, 0); }
function intruderWalk(i, from, to, t0, t1, t, speed = 1.3) {
  const p = clamp((t - t0) / (t1 - t0));
  i.root.position.copy(vmix(from, to, p));
  const dir = to.clone().sub(from); i.root.rotation.y = Math.atan2(dir.x, dir.z);
  i.walk(from.distanceTo(to) * p * 3.6 / speed * 1.0, p > 0 && p < 1 ? 1 : 0);
}
function beamSweep(i, center, amp, rate, t, phase = 0) {
  const tgt = center.clone(); tgt.x += Math.sin(t * rate + phase) * amp; tgt.z += Math.cos(t * rate * 0.7 + phase) * amp * 0.4;
  i.pointAt(tgt);
}

const SHOTS = [
  // S01 — library, Dev talking, lightning + blackout, beams at the doors
  [0.0, 4.2, (u, d, t) => {
    lighting(t < 2.35 || (t > 2.42 && t < 2.5) ? 'lit' : 'dark', t);
    dev.root.position.set(0.05, 0, 0.3); dev.root.rotation.set(0, 0, 0);
    const turn = ease((t - 2.9) / 0.5);
    dev.pose({ ...P.sit, spine: [6, -35 * turn, 0], neck: [-2, -75 * turn, 0], lSh: [-55 + 20 * turn, 0, 12], rSh: [-55, 0, -12] });
    dev.face({ mouth: speakingMouth('DEV', t), lookX: t < 2.35 ? 0 : -0.8 * turn, lookY: 0.1, worry: t < 2.35 ? 0.1 : 0.9, eyeScale: t < 2.35 ? 1 : 0.8 });
    // intruders behind the closed doors (beams through door windows)
    i1.root.position.set(0.3, 0, -13.2); i1.root.rotation.y = 0; i1.pointAt(V(0.4, 1.4, -11.8));
    i2.root.position.set(-1.0, 0, -13.6); i2.root.rotation.y = 0.2; i2.pointAt(V(-0.4, 1.6, -11.8));
    i3.root.position.set(1.6, 0, -13.5); i3.root.rotation.y = -0.2; i3.pointAt(V(0.9, 1.5, -11.8));
    const push = ease((u - 2.8) / 1.4);
    setCam(V(-0.12, 1.32, mix(2.55, 2.3, push)), V(mix(0.0, 0.05, push), mix(1.1, 1.2, push), mix(0.2, -5, push)), mix(68, 52, push), 0, 0.012, t);
  }],
  // S02 — "GET DOWN!" Dev lunges, camera drops under the table
  [4.2, 6.2, (u, d, t) => {
    lighting('dark', t);
    dev.root.position.set(0.05, 0, 0.3);
    const lp = ease(u / 0.3), drop = ease((u - 0.75) / 0.75), dropY = ease((u - 0.7) / 0.45), dropZ = ease((u - 1.0) / 0.6);
    dev.pose(lerpPose(lerpPose(P.sit, P.lunge, lp), P.fours, ease((u - 0.8) / 0.4)));
    dev.root.position.set(mix(0.05, -0.75, ease((u - 0.8) / 0.5)), mix(0, -0.2, ease((u - 0.8) / 0.4)), 0.3);
    dev.face({ mouth: speakingMouth('DEV', t), lookX: 0, lookY: 0.2, worry: 1, eyeScale: 0.75 });
    const pos = V(mix(-0.12, 0.45, drop), mix(1.32, 0.5, dropY), mix(2.45, 1.0, dropZ));
    const look = vmix(V(0.05, 1.2, 0.3), V(-0.3, 1.0, -8), drop);
    setCam(pos, look, mix(66, 74, drop), mix(0, 0.12, Math.sin(drop * Math.PI)), 0.02 + 0.05 * Math.sin(drop * Math.PI), t);
    for (const [i, x, z] of [[i1, 0.3, -13.2], [i2, -1.0, -13.6], [i3, 1.6, -13.5]]) { i.root.position.set(x, 0, z); i.pointAt(V(x * 0.5, 1.3, -11.8)); }
  }],
  // S03 — doors burst open, ponchos enter; "Nobody move. Nobody talk."
  [6.2, 10.2, (u, d, t) => {
    lighting('dark', t);
    const op = easeOut((t - 6.55) / 0.35);
    lib.doors.forEach((dr) => (dr.piv.rotation.y = dr.s * 1.75 * op + (op >= 1 ? 0 : 0)));
    intruderWalk(i1, V(-0.4, 0, -13.0), V(-1.85, 0, -5.4), 6.6, 10.2, t);
    intruderWalk(i2, V(-0.8, 0, -13.6), V(-2.1, 0, -9.0), 6.9, 10.2, t);
    intruderWalk(i3, V(0.6, 0, -13.8), V(1.6, 0, -10.8), 7.1, 10.2, t);
    beamSweep(i1, V(-0.2, 0.3, -3), 2.2, 1.1, t, 0); beamSweep(i2, V(-3.5, 0.5, -6), 2.5, 0.9, t, 2); beamSweep(i3, V(3.0, 0.6, -6), 2.5, 0.8, t, 4);
    i1.hood.rotation.x = t > 7.3 && t < 9.9 ? -0.15 : 0;
    dev.root.position.set(50, 0, 0);
    setCam(V(-0.9, 0.58, 0.95), V(-1.7, 1.25, -10), mix(72, 64, ease(u / d)), 0.02, 0.006, t);
  }],
  // S04 — RULE 1
  [10.2, 13.6, (u, d, t) => { lighting('dark', t); underTableBG(t); }],
  // S05a — keys insert: legs + keyring pass by
  [13.6, 14.9, (u, d, t) => {
    lighting('dark', t);
    intruderWalk(i1, V(-1.85, 0, -0.4), V(-1.85, 0, 3.0), 13.0, 15.6, t, 1.0);
    i1.pointAt(i1.root.position.clone().add(V(0.3, -1.2, 2.5)));
    setCam(V(-0.35, 0.42, 1.4), V(-1.85, 0.68, mix(1.0, 1.7, u / d)), 56, 0, 0.004, t);
    placeDevUnderA(); dev.pose(P.fours);
  }],
  // S05b — Dev under the table: "those are Mr. Hale's keys"
  [14.9, 18.0, (u, d, t) => {
    lighting('dark', t);
    placeDevUnderA(); dev.pose({ ...P.fours, neck: [-52, Math.sin(t * 0.8) * 6, 0] });
    dev.face({ mouth: speakingMouth('DEV', t), lookX: u < 0.6 ? -0.9 : 0, lookY: 0.15, worry: 1, eyeScale: 0.8 });
    intruderWalk(i1, V(-1.85, 0, 1.0), V(-1.85, 0, -1.0), 14.9, 18.0, t, 1.0);
    beamSweep(i1, V(-1.0, 0.0, 0.5), 1.0, 1.4, t);
    setCam(V(0.05, 0.56, 1.95), V(0.03, 0.62, 0.6), mix(62, 56, u / d), 0, 0.004, t);
  }],
  // S06 — "Maya Torres."
  [18.0, 20.4, (u, d, t) => {
    lighting('dark', t);
    i1.root.position.set(-1.9, 0, -1.2); i1.root.rotation.y = 0.5; i1.walk(0, 0);
    i1.hood.rotation.set(-0.12 + Math.sin(u * 2) * 0.02, 0.15, 0.08);
    i1.pointAt(V(mix(-1.6, -0.4, ease(u / d)), 0.2, mix(0.2, 0.9, ease(u / d))));
    intruderWalk(i2, V(-3.0, 0, -5.4), V(-2.6, 0, -4.2), 17.0, 20.4, t);
    beamSweep(i2, V(-4.5, 0.3, -2.5), 1.5, 1.0, t, 1);
    i3.root.position.set(2.0, 0, -7.4); beamSweep(i3, V(3.6, 0.5, -4), 2, 0.7, t, 3);
    placeDevUnderA(); dev.pose(P.fours);
    setCam(V(-0.6, 0.4, 1.0), V(-1.9, 1.35, -1.2), mix(62, 50, ease(u / d)), 0, 0.003, t);
  }],
  // S07 — "they said YOUR name" / "How do they even know ME?"
  [20.4, 25.0, (u, d, t) => {
    lighting('dark', t);
    placeDevUnderA(); dev.pose({ ...P.fours, neck: [-50, 0, Math.sin(t * 9) * 1.2] });
    const mayaTalk = t > 22.9;
    dev.face({ mouth: speakingMouth('DEV', t), lookX: mayaTalk ? Math.sin(t * 3) * 0.4 : 0, lookY: 0.15, worry: 1, eyeScale: 0.7 });
    i1.root.position.set(-1.9, 0, -1.6); i1.root.rotation.y = 0.3; beamSweep(i1, V(-0.4, 0, -0.5), 1.4, 0.9, t);
    setCam(V(0.05, 0.56, 1.95), V(0.03, 0.64, 0.6), mix(56, 44, ease(u / d)), 0, 0.005, t);
  }],
  // S08 — RULE 2
  [25.0, 28.4, (u, d, t) => { lighting('dark', t); underTableBG(t); }],
  // S09 — "Maya. Come out, Maya." beam sweeping under tables
  [28.4, 31.4, (u, d, t) => {
    lighting('dark', t);
    intruderWalk(i1, V(-1.9, 0, -0.6), V(-1.9, 0, -2.4), 28.4, 31.4, t, 0.8);
    i1.hood.rotation.set(-0.1, 0.4 * Math.sin(u * 1.3), 0);
    i1.pointAt(V(mix(-3.4, -0.2, ease(u / d)), 0.15, mix(-2.8, 1.0, ease(u / d))));
    i2.root.position.set(-3.6, 0, -4.6); i2.root.rotation.y = 0.8; beamSweep(i2, V(-5, 0.2, -3), 1.5, 1.2, t, 2);
    i3.root.position.set(1.6, 0, -8.6); i3.root.rotation.y = -0.4; beamSweep(i3, V(2.6, 0.3, -5.5), 1.6, 0.9, t, 5);
    dev.root.position.set(0.9, 0, 2.3); dev.root.rotation.set(0, -1.2, 0); dev.pose(P.fours);
    setCam(V(0.55, 0.42, 1.55), V(-1.6, 0.75, -2.5), 72, 0, 0.004, t);
  }],
  // S10 — Jordan under the next table
  [31.4, 37.4, (u, d, t) => {
    lighting('dark', t);
    jordan.root.position.set(2.05, 0, 1.45); jordan.root.rotation.set(0, -Math.PI / 2, 0);
    jordan.pose({ ...P.hug, neck: [-20, 0, Math.sin(t * 0.9) * 3] });
    jordan.face({ mouth: speakingMouth('JORDAN', t) * 0.8, lookX: 0, lookY: 0.05, worry: 1, eyeScale: 0.8 });
    const pan = ease(u / 0.55);
    const look = vmix(V(-0.5, 0.7, -3), V(1.85, 0.6, 1.45), pan);
    setCam(V(0.55, 0.3, 1.45), look, mix(66, 48, ease((u - 0.5) / 5)), 0, 0.004 + (1 - pan) * 0.01, t);
    i1.root.position.set(-1.9, 0, -2.4); beamSweep(i1, V(0.5, 0.0, -1), 1.6, 0.8, t);
    placeDevUnderA(); dev.pose(P.fours);
  }],
  // S11 — RULE 3
  [37.4, 40.8, (u, d, t) => { lighting('dark', t); underTableBG(t); }],
  // S12 — "Dev. Back stairwell. Crawl."
  [40.8, 43.4, (u, d, t) => {
    lighting('dark', t);
    placeDevUnderA();
    const nod = t > 42.7 ? Math.sin((t - 42.7) * 12) * 8 * Math.exp(-(t - 42.7) * 3) : 0;
    dev.pose({ ...P.fours, neck: [-50 + nod, 0, 0] });
    dev.face({ mouth: 0, lookX: 0, lookY: 0.15, worry: 0.8, eyeScale: 0.85 });
    i1.root.position.set(-1.9, 0, -2.6); beamSweep(i1, V(-0.6, 0.0, -1.5), 1.2, 0.9, t);
    setCam(V(0.05, 0.56, 1.95), V(0.03, 0.64, 0.6), mix(50, 46, u / d), 0, 0.004, t);
  }],
  // S13 — crawl into the shelf aisle
  [43.4, 49.4, (u, d, t) => {
    lighting('dark', t);
    const path = new THREE.CatmullRomCurve3([V(0.4, 0, 1.2), V(1.3, 0, 0.6), V(2.6, 0, -0.4), V(4.0, 0, -1.2), V(5.6, 0, -1.25), V(6.6, 0, -1.25)]);
    const len = path.getLength();
    const gap = 1.45 / len;
    const s = clamp(u / 5.8) * (1 - gap);
    const sd = clamp(s + gap);
    const dp = path.getPointAt(sd), dt = path.getTangentAt(sd);
    dev.root.position.copy(dp); dev.root.rotation.set(0, Math.atan2(dt.x, dt.z), 0);
    const ph = s * len * 7.5;
    const back = t > 43.7 && t < 46.1 ? 1 : 0;
    dev.pose({ ...crawlPose(ph), neck: [-52, back * 55, 0] });
    dev.face({ mouth: speakingMouth('DEV', t), lookX: 0, lookY: 0, worry: 1, eyeScale: 0.8 });
    const cp = path.getPointAt(s), ct = path.getTangentAt(s);
    const bob = Math.sin(ph) * 0.02;
    setCam(V(cp.x, 0.58 + bob, cp.z), V(cp.x + ct.x * 2, 0.5, cp.z + ct.z * 2), 74, Math.sin(ph) * 0.02, 0.004, t);
    // POV hands alternate
    povHands.visible = true;
    povL.position.set(0.26, -0.32 - Math.max(0, Math.sin(ph)) * 0.05, -0.38 - Math.max(0, Math.sin(ph)) * 0.12); povL.rotation.set(-1.25, 0, 0.15);
    povR.position.set(-0.26, -0.32 - Math.max(0, -Math.sin(ph)) * 0.05, -0.38 - Math.max(0, -Math.sin(ph)) * 0.12); povR.rotation.set(-1.25, 0, -0.15);
    // beam passes over the shelves
    i1.root.position.set(1.8, 0, -3.6); i1.root.rotation.y = 1.2; i1.walk(0, 0);
    i1.pointAt(V(mix(3.8, 7.4, ease((t - 46.2) / 1.6)), 2.45, mix(-0.4, -1.8, ease((t - 46.2) / 1.6))));
    i2.root.position.set(-1.9, 0, -4.4); beamSweep(i2, V(-1, 0.3, -1), 1.5, 1, t);
  }],
  // S14 — RULE 4
  [49.4, 52.8, (u, d, t) => { lighting('dark', t); aisleBG(t); }],
  // S15 — the chute; "GO! I'll cover you!"; push into the dark
  [52.8, 55.8, (u, d, t) => {
    lighting('dark', t);
    dev.root.position.set(7.0, 0, -1.3); dev.root.rotation.set(0, 0.25, 0);
    dev.pose({ hy: 0.52, spine: [12, -25, 0], neck: [0, -60, 0], lSh: [-20, 0, 25], lEl: -40, rSh: [-125, 0, -15], rEl: -25, lHip: [-5, 0, 4], rHip: [-5, 0, -4], lKnee: 95, rKnee: 95 });
    dev.face({ mouth: speakingMouth('DEV', t), lookX: 0.3, lookY: 0.1, worry: 1, eyeScale: 0.75 });
    lib.chute.flap.rotation.z = -mix(0, 1.25, ease(u / 0.5));
    // stairwell window: a flashlight behind it
    lib.stairWindow.material.color.setRGB(0.05 + 0.9 * clamp(Math.sin(t * 5) * 0.5 + 0.6), 0.05 + 0.85 * clamp(Math.sin(t * 5) * 0.5 + 0.6), 0.1 + 0.6 * clamp(Math.sin(t * 5) * 0.5 + 0.5));
    const go = easeIn((u - 1.65) / 1.3);
    const pos = vmix(V(5.35, 0.6, -1.2), V(7.62, 0.56, -0.55), go);
    const look = vmix(V(7.4, 0.78, -1.0), V(9.0, 0.56, -0.55), go);
    setCam(pos, look, mix(70, 80, go), 0, 0.006 + go * 0.02, t);
    i1.root.position.set(3.0, 0, -1.25); i1.root.rotation.y = Math.PI / 2; i1.pointAt(V(5.0, 0.2, -1.25 + Math.sin(t * 2) * 0.6));
    povHands.visible = true;
    povL.position.set(0.26, -0.34, -0.4); povL.rotation.set(-1.25, 0, 0.15); povR.position.set(-0.26, -0.34, -0.4); povR.rotation.set(-1.25, 0, -0.15);
  }],
  // S16 — slide down the tunnel, crash into the basement; "Where does this even go?"
  [55.8, 60.4, (u, d, t) => {
    if (t < 57.6) {
      lighting('base', t);
      const p = clamp(easeIn(u / 1.8) * 0.9 + u / 1.8 * 0.08);
      const pt = tunnel.curve.getPointAt(p).add(TUN_O), tg = tunnel.curve.getTangentAt(p);
      tunnel.lights.forEach((l, k) => (l.intensity = 3 + Math.sin(t * 30 + k) * 1.5));
      setCam(pt, pt.clone().add(tg), 92, Math.sin(u * 6) * 0.35, 0.02, t);
    } else {
      lighting('base', t);
      const v = t - 57.6;
      const land = easeOut(v / 0.25);
      const pos = V(BAS_O.x, mix(1.5, 0.62, land), BAS_O.z + mix(4.2, 3.7, land));
      const lookX = Math.sin(clamp((v - 0.9) / 2.2) * Math.PI * 1.5) * 1.4;
      setCam(pos, V(BAS_O.x + lookX, mix(0.3, 0.8, ease(v / 0.8)), BAS_O.z - 2), 72, 0, v < 0.5 ? 0.06 * (1 - v / 0.5) : 0.004, t);
      phoneLight.intensity = 0;
    }
  }],
  // S17/18 — darkness, buzz, RULE 5
  [60.4, 65.2, (u, d, t) => {
    lighting('base', t);
    setCam(V(BAS_O.x, 0.62, BAS_O.z + 3.7), V(BAS_O.x, 0.0, BAS_O.z + 2.5), 70, 0, 0.003, t);
  }],
  // S19 — look up... the thing on the ceiling. "Found you."
  [65.2, 69.4, (u, d, t) => {
    lighting('base', t);
    phoneLight.intensity = 9 + Math.sin(t * 13) * 0.6;
    const tilt = ease(u / 2.0);
    const pos = V(BAS_O.x, 0.62, BAS_O.z + 3.7);
    const look = V(BAS_O.x, mix(0.1, 2.05, tilt), BAS_O.z + mix(2.4, 2.1, tilt));
    const zoom = ease((u - 2.4) / 1.8);
    setCam(pos, look, mix(72, 46, zoom), 0, 0.004 + zoom * 0.004, t);
    thing.root.position.set(BAS_O.x, 2.45, BAS_O.z + 1.6);
    thing.spread(t);
    const twitch = t > 67.0 ? Math.sin((t - 67.0) * 40) * Math.exp(-(t - 67.0) * 6) : 0;
    thing.neck.rotation.set(0, 0, twitch * 0.3);
    thing.head.rotation.set(0.7, 0, -0.45 * ease((u - 1.6) / 0.6) + twitch * 0.5);
  }],
  // S20 — it drops
  [69.4, 71.0, (u, d, t) => {
    lighting('base', t);
    phoneLight.intensity = 10;
    const fall = easeIn(u / 0.5);
    const pos = V(BAS_O.x, 0.62, BAS_O.z + 3.7);
    setCam(pos, V(BAS_O.x, 2.05, BAS_O.z + 2.1), 46, 0, 0.01 + fall * 0.05, t);
    thing.root.position.set(BAS_O.x, mix(2.45, 1.55, fall), BAS_O.z + mix(1.6, 2.9, fall));
    thing.spread(t * 3);
    thing.head.rotation.set(0.7, 0, -0.45);
  }],
];
const RULE_TIMES = [[10.2, 13.6, 1], [25.0, 28.4, 2], [37.4, 40.8, 3], [49.4, 52.8, 4], [61.9, 65.2, 5]];

function underTableBG(t) {
  placeDevUnderA(); dev.pose(P.fours); dev.face({ worry: 1 });
  i1.root.position.set(-1.9, 0, -1.0); beamSweep(i1, V(-0.5, 0, 0.5), 1.2, 1, t);
  setCam(V(0.05, 0.56, 1.95), V(0.03, 0.2, 1.0), 62, 0, 0.004, t);
}
function aisleBG(t) {
  dev.root.position.set(6.4, 0, -1.25); dev.root.rotation.set(0, Math.PI / 2, 0); dev.pose(P.fours);
  setCam(V(5.4, 0.55, -1.25), V(6.6, 0.3, -1.25), 62, 0, 0.004, t);
}

// ---------- frame ----------
function resetFrame() {
  for (const i of intruders) { i.root.position.set(0, -50, 0); i.walk(0, 0); i.hood.rotation.set(0, 0, 0); i.flash.userData.light.intensity = 45; i.root.rotation.set(0, 0, 0); }
  dev.root.position.set(0, -50, 0); jordan.root.position.set(0, -50, 0); thing.root.position.set(0, -50, 0);
  povHands.visible = false; phoneLight.intensity = 0;
  lib.doors.forEach((dr) => (dr.piv.rotation.y = 0));
  lib.chute.flap.rotation.z = 0;
  lib.stairWindow.material.color.setHex(0x0c1220);
  canvas.style.filter = '';
  blackEl.style.opacity = 0; whiteEl.style.opacity = 0; glowEl.style.opacity = 0;
  post.uniforms.uBright.value = 1;
}
function brightFor(mode) { return mode === 'lit' ? 1.0 : mode === 'base' ? 1.3 : 1.32; }

window.renderAt = function (t) {
  resetFrame();
  uniforms.uTime.value = t; post.uniforms.uTime.value = t;
  flashAmt = lightningAt(t, LIGHTNING);
  let idx = SHOTS.findIndex(([a, b]) => t >= a && t < b);
  if (idx < 0) idx = SHOTS.length - 1;
  const [a, b, fn] = SHOTS[idx];
  fn(t - a, b - a, t);
  const R = RULE_TIMES.find(([s0, e0]) => t >= s0 && t < e0);
  if (R) {
    const [st, en, rule] = R;
    phoneOverlay(rule, t - st, en - st);
    canvas.style.filter = 'blur(7px) brightness(0.62)';
  } else phoneOverlay(0);
  // darkness / flashes / glow
  if (t >= 59.9 && t < 65.2) {
    const k = t < 60.4 ? (t - 59.9) / 0.5 : 1;
    post.uniforms.uBright.value = mix(1, 0.08, clamp(k));
    const buzz = t > 60.6 && t < 61.9 ? (Math.sin((t - 60.6) * 6.5) > 0.2 ? 1 : 0.25) : 0;
    glowEl.style.opacity = buzz * 0.8 + (t >= 61.9 ? 0.5 : 0);
  }
  if (t >= 55.3 && t < 55.8) blackEl.style.opacity = ease((t - 55.3) / 0.5);
  if (t >= 55.8 && t < 56.0) blackEl.style.opacity = 1 - (t - 55.8) / 0.2;
  if (t >= 57.6 && t < 57.75) whiteEl.style.opacity = 0.8 * (1 - (t - 57.6) / 0.15);
  if (t >= 69.9) blackEl.style.opacity = 1;
  if (t < 0.25) blackEl.style.opacity = 1 - t / 0.25;
  captions(t);
  renderer.setRenderTarget(rt); renderer.render(scene, camera);
  renderer.setRenderTarget(null); renderer.render(postScene, postCam);
};

await document.fonts.ready;
// warm up: compile all shaders once
window.renderAt(5); window.renderAt(66);
window.READY = true;
