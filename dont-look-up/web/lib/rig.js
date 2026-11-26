// Cartoon character rigs: students (Dev, Jordan), poncho intruders, the ceiling creature.
import * as THREE from './three.module.js';
import { toon, ink, inkMat, sphere, limb, cyl, box } from './toon.js';

const D2R = Math.PI / 180;
const G = () => new THREE.Group();
function setRot(o, r) { if (r == null) return; if (typeof r === 'number') o.rotation.set(r * D2R, 0, 0); else o.rotation.set((r[0] || 0) * D2R, (r[1] || 0) * D2R, (r[2] || 0) * D2R); }

// upward capsule (for torsos)
function trunk(r, len, color) {
  const g = new THREE.CapsuleGeometry(r, len - 2 * r, 6, 16).translate(0, len / 2, 0);
  const m = new THREE.Mesh(g, toon(color));
  m.add(new THREE.Mesh(new THREE.CapsuleGeometry(r + 0.012, len - 2 * r, 6, 16).translate(0, len / 2, 0), inkMat));
  return m;
}

export class Person {
  constructor(c) {
    this.c = c;
    const root = (this.root = G());
    const hips = (this.hips = G()); root.add(hips);
    const pel = sphere(0.16, c.pants, 0.012); pel.scale.set(1, 0.62, 0.78); hips.add(pel);
    // spine + torso
    const spine = (this.spine = G()); hips.add(spine);
    const tor = trunk(0.165, 0.5, c.top); tor.scale.set(1, 1, 0.78); spine.add(tor);
    if (c.strings) {
      for (const s of [-1, 1]) { const st = cyl(0.008, 0.008, 0.16, 0xffffff, 0.004, 6); st.position.set(0.04 * s, 0.33, 0.13); spine.add(st); }
    }
    if (c.pocket) { const p = box(0.2, 0.08, 0.02, c.pocket, 0.006); p.position.set(0, 0.16, 0.125); spine.add(p); }
    const hood = sphere(0.13, c.hood || c.top, 0.01); hood.scale.set(1.25, 0.55, 0.9); hood.position.set(0, 0.47, -0.07); spine.add(hood);
    // neck + head
    const neck = (this.neck = G()); neck.position.y = 0.5; spine.add(neck);
    const nk = cyl(0.05, 0.055, 0.08, c.skin, 0.008); nk.position.y = 0.03; neck.add(nk);
    const head = (this.head = G()); head.position.y = 0.2; neck.add(head);
    const hs = sphere(0.19, c.skin, 0.013, 28); hs.scale.set(1, 1.02, 0.96); head.add(hs);
    for (const s of [-1, 1]) { const ear = sphere(0.045, c.skin, 0.008, 10); ear.scale.set(0.6, 1, 1); ear.position.set(0.185 * s, 0, 0); head.add(ear); }
    const nose = sphere(0.03, c.skin, 0.006, 10); nose.position.set(0, -0.03, 0.18); head.add(nose);
    // eyes
    this.pupils = []; this.lids = []; this.brows = [];
    for (const s of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.062, 20, 14), toon(0xffffff, { emissive: 0x606060 })); ink(eye, 0.009); eye.scale.set(0.9, 1.1, 0.6); eye.position.set(0.075 * s, 0.035, 0.155); head.add(eye);
      const pu = new THREE.Mesh(new THREE.SphereGeometry(0.028, 14, 10), toon(0x111111)); pu.scale.set(1, 1.15, 0.5);
      pu.userData.base = new THREE.Vector3(0.075 * s, 0.035, 0.19); pu.position.copy(pu.userData.base); head.add(pu); this.pupils.push(pu);
      const hl = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff })); hl.position.set(0.01, 0.012, 0.012); pu.add(hl);
      const br = box(0.085, 0.018, 0.02, c.hair, 0.004); br.position.set(0.075 * s, 0.13, 0.172); br.userData.s = s; head.add(br); this.brows.push(br);
    }
    // mouth
    const mouth = (this.mouth = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 10), toon(0x3a0d14)));
    mouth.scale.set(1, 0.18, 0.4); mouth.position.set(0, -0.095, 0.165); ink(mouth, 0.006); head.add(mouth);
    // hair
    const hair = G(); head.add(hair);
    if (c.hairStyle === 'messy') {
      const pts = [[0, 0.13, -0.02, 0.15], [-0.09, 0.11, 0.05, 0.1], [0.09, 0.12, 0.04, 0.1], [0, 0.16, 0.05, 0.1], [-0.12, 0.05, -0.05, 0.11], [0.12, 0.05, -0.05, 0.11], [0, 0.06, -0.12, 0.15], [0.05, 0.17, 0.08, 0.07], [-0.06, 0.165, 0.085, 0.07]];
      for (const [x, y, z, r] of pts) { const h = sphere(r, c.hair, 0.01, 14); h.position.set(x, y, z); hair.add(h); }
    } else if (c.hairStyle === 'puff') {
      const cap = sphere(0.2, c.hair, 0.01, 20); cap.scale.set(1, 0.85, 1); cap.position.set(0, 0.05, -0.02); hair.add(cap);
      for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; const h = sphere(0.075, c.hair, 0.01, 12); h.position.set(Math.cos(a) * 0.1, 0.18 + Math.sin(a) * 0.07, -0.1 + Math.sin(a * 2) * 0.03); hair.add(h); }
      const band = cyl(0.205, 0.205, 0.035, c.band || 0xffd23f, 0.006, 24); band.position.set(0, 0.11, -0.01); band.rotation.x = -0.35; hair.add(band);
    }
    // arms
    const mkArm = (s) => {
      const sh = G(); sh.position.set(0.2 * s, 0.43, 0); spine.add(sh);
      sh.add(limb(0.062, 0.28, c.top, 0.011));
      const el = G(); el.position.y = -0.27; sh.add(el);
      el.add(limb(0.056, 0.25, c.top, 0.011));
      const cuff = cyl(0.06, 0.06, 0.04, c.cuff || c.top, 0.008); cuff.position.y = -0.23; el.add(cuff);
      const hand = sphere(0.06, c.skin, 0.009, 14); hand.scale.set(0.85, 1.1, 0.7); hand.position.y = -0.29; el.add(hand);
      return [sh, el];
    };
    [this.lSh, this.lEl] = mkArm(1); [this.rSh, this.rEl] = mkArm(-1);
    // legs
    const mkLeg = (s) => {
      const hp = G(); hp.position.set(0.09 * s, -0.02, 0); hips.add(hp);
      hp.add(limb(0.078, 0.42, c.pants, 0.011));
      const kn = G(); kn.position.y = -0.41; hp.add(kn);
      kn.add(limb(0.068, 0.4, c.pants, 0.011));
      const shoe = box(0.13, 0.09, 0.26, c.shoe, 0.01); shoe.position.set(0, -0.41, 0.05); kn.add(shoe);
      const sole = box(0.135, 0.03, 0.27, 0xf2f2f2, 0.008); sole.position.set(0, -0.455, 0.05); kn.add(sole);
      return [hp, kn];
    };
    [this.lHip, this.lKnee] = mkLeg(1); [this.rHip, this.rKnee] = mkLeg(-1);
    // contact shadow
    const sh = new THREE.Mesh(new THREE.CircleGeometry(0.45, 24), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.35, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = 0.006; sh.scale.set(1, 1.4, 1); root.add(sh); this.shadow = sh;
  }
  pose(p) {
    this.hips.position.set(p.hx || 0, p.hy ?? 0.9, p.hz || 0);
    setRot(this.hips, p.hips || 0); setRot(this.spine, p.spine || 0); setRot(this.neck, p.neck || 0); setRot(this.head, p.head || 0);
    setRot(this.lSh, p.lSh || [0, 0, 8]); setRot(this.rSh, p.rSh || [0, 0, -8]);
    setRot(this.lEl, p.lEl || -10); setRot(this.rEl, p.rEl || -10);
    setRot(this.lHip, p.lHip || 0); setRot(this.rHip, p.rHip || 0);
    setRot(this.lKnee, p.lKnee || 0); setRot(this.rKnee, p.rKnee || 0);
  }
  face({ mouth = 0, lookX = 0, lookY = 0, worry = 0.5, eyeScale = 1 } = {}) {
    this.mouth.scale.set(0.9 - mouth * 0.25, 0.16 + mouth * 0.75, 0.4);
    for (const p of this.pupils) {
      p.position.copy(p.userData.base); p.position.x += lookX * 0.022; p.position.y += lookY * 0.02;
      p.scale.set(eyeScale, 1.15 * eyeScale, 0.5);
    }
    for (const b of this.brows) { b.rotation.z = -b.userData.s * worry * 0.45; b.position.y = 0.13 + worry * 0.014; }
  }
}

export function lerpPose(a, b, t) {
  const o = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const va = a[k] ?? b[k], vb = b[k] ?? a[k];
    if (Array.isArray(va) || Array.isArray(vb)) {
      const A = Array.isArray(va) ? va : [va, 0, 0], B = Array.isArray(vb) ? vb : [vb, 0, 0];
      o[k] = [0, 1, 2].map((i) => (A[i] || 0) + ((B[i] || 0) - (A[i] || 0)) * t);
    } else o[k] = va + (vb - va) * t;
  }
  return o;
}

// ---------- flashlight beam ----------
const beamMat = () => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  uniforms: { uI: { value: 0.42 }, uCol: { value: new THREE.Color(1.0, 0.93, 0.75) } },
  vertexShader: `varying float vL; varying vec3 vN; varying vec3 vV;
    void main(){ vL = uv.y; vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `uniform float uI; uniform vec3 uCol; varying float vL; varying vec3 vN; varying vec3 vV;
    void main(){ float f = pow(abs(dot(normalize(vN), normalize(vV))), 1.5); float a = uI * pow(vL, 1.3) * f; gl_FragColor = vec4(uCol, a); }`,
});
export function makeFlashlight(scene, { len = 7, ang = 0.32, intensity = 45 } = {}) {
  const g = G();
  const body = cyl(0.032, 0.026, 0.24, 0x2b2f36, 0.007); body.rotation.x = Math.PI / 2; g.add(body);
  const head = cyl(0.045, 0.034, 0.06, 0x2b2f36, 0.007); head.rotation.x = Math.PI / 2; head.position.z = 0.14; g.add(head);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.038, 16), new THREE.MeshBasicMaterial({ color: 0xfff6dc })); lens.position.z = 0.172; g.add(lens);
  const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.04, Math.tan(ang) * len, len, 24, 1, true), beamMat());
  cone.geometry.translate(0, -len / 2, 0); cone.rotation.x = -Math.PI / 2; cone.position.z = 0.17; g.add(cone);
  const sl = new THREE.SpotLight(0xfff0d0, intensity, len * 2.2, ang * 1.05, 0.45, 1.0);
  sl.position.z = 0.17; g.add(sl);
  const tgt = new THREE.Object3D(); tgt.position.z = 3; g.add(tgt); sl.target = tgt;
  g.userData = { cone, light: sl, lens };
  return g;
}

// ---------- poncho intruder ----------
export class Intruder {
  constructor(scene, { keys = false, color = 0xe8c21c } = {}) {
    const root = (this.root = G());
    const body = (this.body = G()); root.add(body);
    const prof = [[0.43, 0.58], [0.42, 0.62], [0.37, 0.9], [0.33, 1.2], [0.29, 1.4], [0.2, 1.5], [0.12, 1.55], [0.0, 1.56]].map(([r, y]) => new THREE.Vector2(r, y));
    const lg = new THREE.LatheGeometry(prof, 28);
    const pon = new THREE.Mesh(lg, toon(color, { side: THREE.DoubleSide })); body.add(pon);
    const pino = new THREE.Mesh(new THREE.LatheGeometry(prof.map((v) => new THREE.Vector2(v.x + 0.014, v.y)), 28), inkMat); body.add(pino);
    // seam lines
    for (const a of [0.5, -0.5]) { const s = box(0.012, 0.85, 0.012, 0x9c7f06, 0); s.position.set(Math.sin(a) * 0.36, 1.0, Math.cos(a) * 0.36); s.rotation.x = -0.12; s.rotation.y = a; body.add(s); }
    // hood with void face
    const hood = (this.hood = G()); hood.position.y = 1.72; body.add(hood);
    const hs = sphere(0.22, color, 0.014, 24); hs.scale.set(1, 1.12, 1.05); hood.add(hs);
    const tip = sphere(0.1, color, 0.01, 12); tip.position.set(0, 0.17, -0.1); hood.add(tip);
    const voidf = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 14), new THREE.MeshBasicMaterial({ color: 0x030306 })); voidf.scale.set(0.95, 1.15, 0.55); voidf.position.set(0, -0.02, 0.15); hood.add(voidf);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.03, 8, 24), toon(color)); rim.scale.set(0.95, 1.2, 1); rim.position.set(0, -0.02, 0.175); hood.add(rim); ink(rim, 0.006);
    // legs
    this.legs = [];
    for (const s of [-1, 1]) {
      const hp = G(); hp.position.set(0.11 * s, 0.82, 0); root.add(hp);
      hp.add(limb(0.075, 0.7, 0x22252e, 0.01));
      const boot = box(0.15, 0.13, 0.3, 0x15161b, 0.01); boot.position.set(0, -0.76, 0.05); hp.add(boot);
      this.legs.push(hp);
    }
    // flashlight arm (right)
    const sh = (this.sh = G()); sh.position.set(-0.3, 1.38, 0.02); body.add(sh);
    sh.add(limb(0.075, 0.32, color, 0.011));
    const el = (this.el = G()); el.position.y = -0.31; sh.add(el);
    el.add(limb(0.065, 0.28, color, 0.011));
    const glove = sphere(0.065, 0x15161b, 0.008, 12); glove.position.y = -0.3; el.add(glove);
    this.flash = makeFlashlight(scene); this.flash.position.y = -0.31; el.add(this.flash);
    // left arm hangs
    const sh2 = (this.sh2 = G()); sh2.position.set(0.3, 1.38, 0); body.add(sh2);
    sh2.add(limb(0.075, 0.32, color, 0.011));
    const el2 = G(); el2.position.y = -0.31; sh2.add(el2); el2.add(limb(0.065, 0.28, color, 0.011));
    const g2 = sphere(0.065, 0x15161b, 0.008, 12); g2.position.y = -0.3; el2.add(g2);
    sh2.rotation.z = 0.12;
    if (keys) {
      const kr = (this.keys = G()); kr.position.set(0.3, 0.72, 0.28); kr.scale.setScalar(1.8); body.add(kr);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.008, 6, 16), toon(0xc9cdd4, { emissive: 0x555555 })); kr.add(ring); ink(ring, 0.004);
      this.keyParts = [];
      for (let i = 0; i < 5; i++) {
        const k = G(); k.position.set(Math.cos(i) * 0.03, -0.045, Math.sin(i) * 0.01); kr.add(k);
        const blade = box(0.016, 0.085, 0.006, i % 2 ? 0xd9b34a : 0xc9cdd4, 0.004, { emissive: 0x555555 }); blade.position.y = -0.05; k.add(blade);
        const bow = new THREE.Mesh(new THREE.CircleGeometry(0.02, 10), toon(i % 2 ? 0xd9b34a : 0xc9cdd4)); bow.position.y = -0.005; k.add(bow);
        k.rotation.z = (i - 2) * 0.35; this.keyParts.push(k);
      }
    }
    const shd = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.4, depthWrite: false }));
    shd.rotation.x = -Math.PI / 2; shd.position.y = 0.006; root.add(shd);
    this.aim(0, -0.2);
  }
  // walk phase in radians, amount 0..1
  walk(ph, amt = 1) {
    this.legs[0].rotation.x = Math.sin(ph) * 0.42 * amt; this.legs[1].rotation.x = -Math.sin(ph) * 0.42 * amt;
    this.body.position.y = Math.abs(Math.cos(ph)) * 0.035 * amt;
    this.body.rotation.z = Math.sin(ph) * 0.03 * amt;
    this.sh2.rotation.x = -Math.sin(ph) * 0.25 * amt;
    if (this.keyParts) this.keyParts.forEach((k, i) => (k.rotation.z = (i - 2) * 0.35 + Math.sin(ph * 2 + i) * 0.35 * amt));
  }
  // aim flashlight: yaw (rad, relative to body) and pitch (rad, negative = down)
  aim(yaw, pitch, raise = 0.75) {
    this.sh.rotation.set(-raise * 1.2, 0, -0.15);
    this.el.rotation.set(-0.6 * raise, 0, 0);
    this.flash.rotation.set(0, 0, 0);
    // orient flashlight in world after update: done by caller via lookAt
    this._yaw = yaw; this._pitch = pitch;
  }
  pointAt(target) {
    this.root.updateMatrixWorld(true);
    const fp = new THREE.Vector3(); this.flash.getWorldPosition(fp);
    const parentQ = new THREE.Quaternion(); this.flash.parent.getWorldQuaternion(parentQ);
    const m = new THREE.Matrix4().lookAt(target, fp, new THREE.Vector3(0, 1, 0));
    const q = new THREE.Quaternion().setFromRotationMatrix(m);
    this.flash.quaternion.copy(parentQ.invert().multiply(q));
  }
}

// ---------- the ceiling creature ----------
export class Creature {
  constructor(faceTex) {
    const root = (this.root = G());
    const white = 0xe9e6df;
    toon(white).emissive.setHex(0x3a3836); toon(0xd8d3c8).emissive.setHex(0x2a2826);
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.75, 6, 16), toon(white)); torso.rotation.x = Math.PI / 2; ink(torso, 0.014); root.add(torso);
    // ribs
    for (let i = 0; i < 4; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.165, 0.012, 6, 20, Math.PI), toon(0xb9b4a8)); r.position.z = -0.15 + i * 0.1; r.rotation.y = Math.PI / 2; r.rotation.z = Math.PI / 2; root.add(r); }
    // neck + head (head hangs down, face looking down at viewer)
    const neck = (this.neck = G()); neck.position.set(0, 0, 0.5); root.add(neck);
    const nk = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.35, 4, 10).translate(0, -0.2, 0), toon(white)); ink(nk, 0.01); neck.add(nk);
    const head = (this.head = G()); head.position.y = -0.45; neck.add(head);
    const skull = sphere(0.26, white, 0.016, 32); skull.scale.set(0.9, 1.15, 0.95); head.add(skull);
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.262, 32, 24, Math.PI * 0.12, Math.PI * 0.76, Math.PI * 0.18, Math.PI * 0.66), new THREE.MeshBasicMaterial({ map: faceTex, transparent: true }));
    face.scale.set(0.905, 1.155, 0.955); head.add(face);
    this.face = face;
    // limbs: 4 long jointed legs reaching to the ceiling plane
    this.limbs = [];
    const mk = (x, z, dir) => {
      const sh = G(); sh.position.set(x, 0, z); root.add(sh);
      const seg1 = limb(0.045, 0.95, white, 0.01); sh.add(seg1);
      const j1 = G(); j1.position.y = -0.93; sh.add(j1);
      const knob = sphere(0.06, 0xd8d3c8, 0.008, 12); j1.add(knob);
      const seg2 = limb(0.038, 1.05, white, 0.01); j1.add(seg2);
      const j2 = G(); j2.position.y = -1.03; j1.add(j2);
      for (let f = 0; f < 3; f++) { const fg = limb(0.014, 0.28, white, 0.006); fg.rotation.z = (f - 1) * 0.45; fg.rotation.x = 0.3; j2.add(fg); }
      this.limbs.push({ sh, j1, x, z, dir });
    };
    mk(0.15, 0.3, 1); mk(-0.15, 0.3, -1); mk(0.15, -0.35, 1); mk(-0.15, -0.35, -1);
    this.spread(0);
  }
  // spider-like: elbows jut down, forearms reach up to the ceiling
  spread(t) {
    const down = new THREE.Vector3(0, -1, 0);
    for (const L of this.limbs) {
      const front = L.z > 0 ? 1 : -1;
      const w = Math.sin(t * 2.2 + L.x * 9 + L.z * 5) * 0.06;
      const d1 = new THREE.Vector3(L.dir * 0.8, -0.38 + w, front * 0.5).normalize();
      const q1 = new THREE.Quaternion().setFromUnitVectors(down, d1);
      L.sh.quaternion.copy(q1);
      const d2 = new THREE.Vector3(L.dir * 0.25, 0.95, front * 0.22 + w).normalize().applyQuaternion(q1.clone().invert());
      L.j1.quaternion.setFromUnitVectors(down, d2);
    }
  }
}

export function creatureFace() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 512, 512);
  // hollow eyes
  for (const s of [-1, 1]) {
    g.save(); g.translate(256 + s * 92, 205); g.rotate(s * 0.18);
    const gr = g.createRadialGradient(0, 0, 4, 0, 0, 62); gr.addColorStop(0, '#000'); gr.addColorStop(0.75, '#050505'); gr.addColorStop(1, 'rgba(40,30,30,0)');
    g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, 46, 62, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.95)'; g.beginPath(); g.arc(-s * 8, -6, 6, 0, 7); g.fill();
    g.restore();
  }
  // painted smile
  g.strokeStyle = '#120808'; g.lineWidth = 12; g.lineCap = 'round';
  g.beginPath(); g.moveTo(110, 318); g.quadraticCurveTo(256, 450, 402, 318); g.stroke();
  g.fillStyle = '#1a0a0a'; g.beginPath(); g.moveTo(118, 322); g.quadraticCurveTo(256, 440, 394, 322); g.quadraticCurveTo(256, 380, 118, 322); g.fill();
  g.fillStyle = '#f4efe2';
  for (let i = 0; i < 13; i++) { const x = 140 + i * 18.6; const y = 330 + Math.sin((i / 12) * Math.PI) * 42; g.fillRect(x, y - 2, 11, 20 - Math.abs(i - 6) * 0.8); }
  // blush + cracks
  g.fillStyle = 'rgba(200,60,70,0.35)'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(256 + s * 150, 300, 34, 18, 0, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(40,30,30,0.85)'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(330, 60); g.lineTo(312, 120); g.lineTo(338, 150); g.lineTo(318, 205); g.moveTo(312, 120); g.lineTo(285, 135);
  g.moveTo(170, 420); g.lineTo(190, 380); g.lineTo(176, 350); g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
