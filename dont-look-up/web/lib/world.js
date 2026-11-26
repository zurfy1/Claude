// Library set, chute tunnel and basement.
import * as THREE from './three.module.js';
import { toon, box, cyl, sphere, inkBox, ink, carpetTex, woodTex, wallTex, tileTex, concreteTex, metalTex, signTex, RNG } from './toon.js';

export const W = { x0: -7.5, x1: 7.5, z0: -12, z1: 5, h: 4.2 };
export const uniforms = { uTime: { value: 0 }, uFlash: { value: 0 } };

function plane(w, h, mat) { return new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); }

function rainWindowMat() {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: `uniform float uTime; uniform float uFlash; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      void main(){
        vec3 sky = mix(vec3(0.05,0.08,0.18), vec3(0.16,0.22,0.40), vUv.y);
        // distant tree line
        float tl = 0.18 + 0.05*sin(vUv.x*23.0) + 0.03*sin(vUv.x*61.0);
        if (vUv.y < tl) sky = vec3(0.02,0.03,0.06);
        // rain streaks
        vec2 g = vec2(vUv.x*42.0, vUv.y*6.0 + uTime*9.0);
        vec2 id = floor(g); float r = h(id);
        float streak = step(0.82, r) * smoothstep(0.0,0.08, fract(g.y)) * (1.0 - fract(g.y)) * smoothstep(0.45,0.5, 1.0-abs(fract(g.x)-0.5));
        vec3 c = sky + streak*0.25;
        c += uFlash * vec3(0.75,0.82,1.0);
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
}

export function buildLibrary(scene) {
  const lib = new THREE.Group(); scene.add(lib);
  const L = { group: lib, lamps: [], ceilingPanels: [], doors: [], chute: null };
  const carpet = carpetTex();
  const floor = plane(W.x1 - W.x0, W.z1 - W.z0, toon(0xffffff, { map: carpet }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, (W.z0 + W.z1) / 2); lib.add(floor);
  // ceiling
  const ceil = plane(W.x1 - W.x0, W.z1 - W.z0, toon(0xffffff, { map: tileTex() }));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, W.h, (W.z0 + W.z1) / 2); lib.add(ceil);
  for (let x = -5; x <= 5; x += 3.4) for (let z = -10; z <= 3; z += 3.2) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.05, 0.5), new THREE.MeshBasicMaterial({ color: 0xfff4da }));
    p.position.set(x, W.h - 0.03, z); lib.add(p); L.ceilingPanels.push(p);
  }
  const wtex = wallTex();
  const wallMat = toon(0xffffff, { map: wtex });
  const wainMat = woodTex('#5e3a22');
  // left wall with windows
  const lw = new THREE.Group(); lib.add(lw);
  const winZ = [-9.2, -5.4, -1.6, 2.2];
  const rainMat = rainWindowMat();
  const segs = []; let zc = W.z0;
  for (const wz of winZ) { segs.push([zc, wz - 0.85]); zc = wz + 0.85; }
  segs.push([zc, W.z1]);
  for (const [a, b] of segs) { const m = box(0.2, W.h, b - a, 0xffffff, 0, { map: wtex }); m.position.set(W.x0, W.h / 2, (a + b) / 2); lw.add(m); }
  for (const wz of winZ) {
    const below = box(0.2, 0.9, 1.7, 0x6b4428, 0.01); below.position.set(W.x0, 0.45, wz); lw.add(below);
    const above = box(0.2, W.h - 3.5, 1.7, 0xffffff, 0, { map: wtex }); above.position.set(W.x0, (W.h + 3.5) / 2, wz); lw.add(above);
    const glass = plane(1.7, 2.6, rainMat); glass.rotation.y = Math.PI / 2; glass.position.set(W.x0 + 0.02, 2.2, wz); lw.add(glass);
    const fr = new THREE.Group(); fr.position.set(W.x0 + 0.09, 2.2, wz); lw.add(fr);
    for (const [w, h, y, z] of [[0.08, 2.7, 0, 0.85], [0.08, 2.7, 0, -0.85], [0.08, 2.7, 0, 0], [1.78, 0.09, 1.3, 0], [1.78, 0.09, -1.3, 0], [1.78, 0.07, 0.35, 0]]) {
      const b = box(0.1, h, w, 0x3a2516, 0.008); b.position.set(0, y, z); fr.add(b);
    }
    const sill = box(0.35, 0.06, 1.9, 0x6b4428, 0.01); sill.position.set(W.x0 + 0.15, 0.92, wz); lw.add(sill);
  }
  // right wall with stairs door + book return chute
  const rw = new THREE.Group(); lib.add(rw);
  const doorZ = -1.95, chuteZ = -0.55;
  for (const [a, b] of [[W.z0, doorZ - 0.6], [doorZ + 0.6, chuteZ - 0.4], [chuteZ + 0.4, W.z1]]) { const m = box(0.2, W.h, b - a, 0xffffff, 0, { map: wtex }); m.position.set(W.x1, W.h / 2, (a + b) / 2); rw.add(m); }
  { const m = box(0.2, W.h - 2.3, 1.2, 0xffffff, 0, { map: wtex }); m.position.set(W.x1, (W.h + 2.3) / 2, doorZ); rw.add(m); }
  { const m = box(0.2, 0.25, 0.8, 0xffffff, 0, { map: wtex }); m.position.set(W.x1, 0.125, chuteZ); rw.add(m); }
  { const m = box(0.2, W.h - 0.9, 0.8, 0xffffff, 0, { map: wtex }); m.position.set(W.x1, (W.h + 0.9) / 2, chuteZ); rw.add(m); }
  // stairs door (closed) with window
  const sd = box(0.08, 2.25, 1.1, 0x4f6d7a, 0.012); sd.position.set(W.x1 - 0.06, 1.13, doorZ); rw.add(sd);
  const sdw = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.55), new THREE.MeshBasicMaterial({ color: 0x0c1220 })); sdw.rotation.y = -Math.PI / 2; sdw.position.set(W.x1 - 0.105, 1.6, doorZ); rw.add(sdw);
  L.stairWindow = sdw;
  const bar = cyl(0.025, 0.025, 0.8, 0xb8bec6, 0.006); bar.rotation.x = Math.PI / 2; bar.position.set(W.x1 - 0.16, 1.05, doorZ); rw.add(bar);
  const ss = plane(0.9, 0.25, new THREE.MeshBasicMaterial({ map: signTex('STAIRS', '#1c6b3a', '#ffffff') })); ss.rotation.y = -Math.PI / 2; ss.position.set(W.x1 - 0.11, 2.5, doorZ); rw.add(ss);
  // chute: dark opening with metal frame and swing flap
  const hole = plane(0.6, 0.6, new THREE.MeshBasicMaterial({ color: 0x020203 })); hole.rotation.y = -Math.PI / 2; hole.position.set(W.x1 + 0.02, 0.58, chuteZ); rw.add(hole);
  for (const [w, h, y, z] of [[0.72, 0.07, 0.9, 0], [0.72, 0.07, 0.25, 0], [0.07, 0.72, 0.575, 0.34], [0.07, 0.72, 0.575, -0.34]]) { const b = box(0.12, h, w, 0x9aa3ad, 0.008); b.position.set(W.x1 - 0.1, y, chuteZ + z); rw.add(b); }
  const flapPivot = new THREE.Group(); flapPivot.position.set(W.x1 - 0.12, 0.88, chuteZ); rw.add(flapPivot);
  const flap = box(0.03, 0.6, 0.6, 0x7d8791, 0.008); flap.position.y = -0.3; flapPivot.add(flap);
  const handle = box(0.04, 0.03, 0.25, 0x2a2f36, 0.004); handle.position.set(-0.03, -0.5, 0); flapPivot.add(handle);
  const cs = plane(0.8, 0.22, new THREE.MeshBasicMaterial({ map: signTex('BOOK RETURN ▼', '#f2e9d0', '#8a1d1d', 512, 140) })); cs.rotation.y = -Math.PI / 2; cs.position.set(W.x1 - 0.11, 1.12, chuteZ); rw.add(cs);
  L.chute = { flap: flapPivot, pos: new THREE.Vector3(W.x1, 0.58, chuteZ) };
  // far wall with double doors
  const fw = new THREE.Group(); lib.add(fw);
  for (const [a, b] of [[W.x0, -1.15], [1.15, W.x1]]) { const m = box(b - a, W.h, 0.2, 0xffffff, 0, { map: wtex }); m.position.set((a + b) / 2, W.h / 2, W.z0); fw.add(m); }
  { const m = box(2.3, W.h - 2.5, 0.2, 0xffffff, 0, { map: wtex }); m.position.set(0, (W.h + 2.5) / 2, W.z0); fw.add(m); }
  const hall = new THREE.Group(); hall.position.set(0, 0, W.z0 - 2); lib.add(hall);
  { const f = box(5, 0.05, 4, 0x8e8a80, 0); f.position.y = -0.02; hall.add(f); const bw = box(5, 3, 0.1, 0x4a5560, 0); bw.position.set(0, 1.5, -1.5); hall.add(bw);
    for (const s of [-1, 1]) { const sw = box(0.1, 3, 4, 0x4a5560, 0); sw.position.set(2.5 * s, 1.5, 0); hall.add(sw); } const hc = box(5, 0.1, 4, 0x2a3038, 0); hc.position.y = 3; hall.add(hc); }
  for (const s of [-1, 1]) {
    const piv = new THREE.Group(); piv.position.set(1.12 * s, 0, W.z0 + 0.05); fw.add(piv);
    const leaf = box(1.08, 2.45, 0.07, 0x6b4428, 0.012); leaf.position.set(-0.55 * s, 1.225, 0); piv.add(leaf);
    const win = plane(0.34, 0.7, new THREE.MeshBasicMaterial({ color: 0x223044 })); win.position.set(-0.55 * s, 1.7, 0.04); piv.add(win);
    const push = box(0.06, 0.35, 0.05, 0xc9a24a, 0.005); push.position.set(-0.95 * s, 1.15, 0.06); piv.add(push);
    L.doors.push({ piv, s, win });
  }
  const exit = plane(0.75, 0.25, new THREE.MeshBasicMaterial({ map: signTex('EXIT', '#b3121b', '#ffffff', 256, 86, 'bold 64px "Barlow Condensed"') })); exit.position.set(0, 2.8, W.z0 + 0.12); fw.add(exit);
  const libSign = plane(2.2, 0.42, new THREE.MeshBasicMaterial({ map: signTex('QUIET PLEASE', '#24384a', '#f3e6c4', 768, 140) })); libSign.position.set(-4.2, 3.2, W.z0 + 0.12); fw.add(libSign);
  const clock = new THREE.Group(); clock.position.set(3.6, 3.1, W.z0 + 0.12); fw.add(clock);
  { const face = cyl(0.3, 0.3, 0.04, 0xf5f0e6, 0.012, 24); face.rotation.x = Math.PI / 2; clock.add(face);
    const hh = box(0.03, 0.17, 0.01, 0x111111, 0); hh.position.set(0.07, 0.03, 0.03); hh.rotation.z = -1.9; clock.add(hh);
    const mh = box(0.02, 0.24, 0.01, 0x111111, 0); mh.position.set(0.04, -0.07, 0.035); mh.rotation.z = -2.9; clock.add(mh); }
  // back wall (behind camera) with shelves
  { const m = box(W.x1 - W.x0, W.h, 0.2, 0xffffff, 0, { map: wtex }); m.position.set(0, W.h / 2, W.z1); lib.add(m); }
  // wainscot rails
  for (const [x, z, w, d] of [[0, W.z0 + 0.12, 15, 0.04], [0, W.z1 - 0.12, 15, 0.04]]) { const r = box(w, 0.1, d, 0x4a2c18, 0.006); r.position.set(x, 1.0, z); lib.add(r); }

  // tables + chairs + lamps
  const tableTop = woodTex('#9a6438');
  const mkTable = (x, z, chairs = true, mess = 0) => {
    const t = new THREE.Group(); t.position.set(x, 0, z); lib.add(t);
    const top = box(2.2, 0.07, 1.1, 0xffffff, 0.012, { map: tableTop }); top.position.y = 0.9; t.add(top);
    const apron = box(2.0, 0.06, 0.95, 0x6e4426, 0.01); apron.position.y = 0.835; t.add(apron);
    for (const [lx, lz] of [[-1.0, -0.45], [1.0, -0.45], [-1.0, 0.45], [1.0, 0.45]]) { const l = box(0.08, 0.86, 0.08, 0x5c381f, 0.01); l.position.set(lx, 0.43, lz); t.add(l); }
    const stretcher = box(1.9, 0.05, 0.05, 0x5c381f, 0.006); stretcher.position.y = 0.15; t.add(stretcher);
    for (const lx of [-0.55, 0.55]) {
      const lamp = new THREE.Group(); lamp.position.set(lx, 0.935, 0); t.add(lamp);
      const base = cyl(0.07, 0.08, 0.03, 0xc9a24a, 0.006); lamp.add(base);
      const stem = cyl(0.012, 0.012, 0.3, 0xc9a24a, 0.004); stem.position.y = 0.15; lamp.add(stem);
      const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.3, 16, 1, false, 0, Math.PI), toon(0x1f7a4d, { side: THREE.DoubleSide, emissive: 0x000000 }));
      shade.rotation.z = Math.PI / 2; shade.rotation.y = Math.PI; shade.position.set(0, 0.3, 0); lamp.add(shade); ink(shade, 0.006);
      const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.02, 0.08), new THREE.MeshBasicMaterial({ color: 0xffe2a0 })); bulb.position.set(0, 0.27, 0); lamp.add(bulb);
      L.lamps.push({ shade, bulb });
    }
    const r = RNG(Math.abs(x * 13 + z * 7) | 0);
    for (let i = 0; i < 3 + mess; i++) {
      const b = box(0.22 + r() * 0.1, 0.035 + r() * 0.03, 0.28, [0xc0392b, 0x2e86c1, 0xf1c40f, 0x27ae60, 0xffffff][(r() * 5) | 0], 0.006);
      b.position.set(-0.9 + r() * 1.8, 0.95 + i * 0.01, -0.4 + r() * 0.35); b.rotation.y = r() * 3; t.add(b);
    }
    if (chairs) for (const [cx, cz, ry, tip] of [[-0.55, 0.85, Math.PI, 0], [0.55, 0.85, Math.PI, 0], [-0.55, -0.85, 0, 0], [0.55, -0.85, 0, r() < 0.3 ? 1 : 0]]) mkChair(t, cx, cz, ry, tip);
    return t;
  };
  const mkChair = (parent, x, z, ry, tip) => {
    const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; parent.add(c);
    const seat = box(0.45, 0.05, 0.42, 0x7a4a28, 0.008); seat.position.y = 0.46; c.add(seat);
    const back = box(0.45, 0.42, 0.05, 0x7a4a28, 0.008); back.position.set(0, 0.72, -0.2); c.add(back);
    for (const [lx, lz] of [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]]) { const l = box(0.04, 0.46, 0.04, 0x4a2c18, 0.006); l.position.set(lx, 0.23, lz); c.add(l); }
    if (tip) { c.rotation.z = Math.PI / 2; c.position.y = 0.23; c.position.x += 0.3; }
    return c;
  };
  L.tableA = mkTable(0, 1.4, false, 2);
  // Maya's table: chairs pushed back
  mkChair(lib, -0.5, 2.55, Math.PI, 0); mkChair(lib, 0.6, 2.5, Math.PI - 0.2, 0); mkChair(lib, 1.35, -0.1, 0.5, 1);
  L.tableJ = mkTable(2.6, 1.4);
  for (const [x, z] of [[0, -2.6], [0, -6.6], [-3.6, 1.4], [-3.6, -2.6], [-3.6, -6.6], [2.6, -6.6]]) mkTable(x, z);

  // bookshelves (instanced books)
  const shelfMat = 0x5a3720;
  const bookGeo = new THREE.BoxGeometry(1, 1, 1);
  const bookMat = toon(0xffffff);
  const books = new THREE.InstancedMesh(bookGeo, bookMat, 6000);
  let bi = 0; const r = RNG(42); const m4 = new THREE.Matrix4(); const col = new THREE.Color();
  const pal = [0xb83a3a, 0x2f6f9f, 0xd8a531, 0x3c8d5a, 0x7b4fb3, 0xe07b39, 0x2c3e50, 0xe8e0c8, 0x8e2f52, 0x1d7c78];
  const fillShelf = (x0, x1, y, z, face) => {
    let x = x0;
    while (x < x1 - 0.05 && bi < 6000) {
      const w = 0.03 + r() * 0.04, h = 0.24 + r() * 0.12;
      if (r() < 0.04) { x += 0.08; continue; }
      const lean = r() < 0.05 ? 0.25 : 0;
      m4.compose(new THREE.Vector3(x + w / 2, y + h / 2, z + face * (0.02 + r() * 0.03)), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, lean)), new THREE.Vector3(w, h, 0.2));
      books.setMatrixAt(bi, m4); books.setColorAt(bi, col.setHex(pal[(r() * pal.length) | 0]).multiplyScalar(0.8 + r() * 0.3)); bi++;
      x += w + 0.002;
    }
  };
  const mkShelfRow = (xa, xb, z, h = 2.3, twoSided = true) => {
    const g = new THREE.Group(); lib.add(g);
    const len = xb - xa, cx = (xa + xb) / 2;
    const back = box(len, h, 0.04, 0x3b2414, 0.008); back.position.set(cx, h / 2, z); g.add(back);
    for (const s of [-1, 1]) { const side = box(0.05, h, 0.5, shelfMat, 0.01); side.position.set(cx + (len / 2) * s, h / 2, z); g.add(side); }
    const top = box(len + 0.08, 0.05, 0.54, shelfMat, 0.01); top.position.set(cx, h, z); g.add(top);
    const levels = 5;
    for (let i = 0; i < levels; i++) {
      const y = 0.08 + i * ((h - 0.15) / levels);
      const sh = box(len, 0.035, 0.5, shelfMat, 0.006); sh.position.set(cx, y, z); g.add(sh);
      fillShelf(xa + 0.04, xb - 0.04, y + 0.02, z + 0.1, 1);
      if (twoSided) fillShelf(xa + 0.04, xb - 0.04, y + 0.02, z - 0.1, -1);
    }
    const lab = plane(0.4, 0.14, new THREE.MeshBasicMaterial({ map: signTex(['A–F', 'G–L', 'M–R', 'S–Z', 'REF'][(Math.abs(z) | 0) % 5], '#f3e6c4', '#24384a', 256, 90, 'bold 60px "Barlow Condensed"') }));
    lab.rotation.y = -Math.PI / 2; lab.position.set(xa - 0.03, h - 0.2, z); g.add(lab);
    return g;
  };
  for (const z of [0.0, -2.5, -5.0, -7.5, -10.0]) mkShelfRow(4.4, 7.4, z);
  for (const [xa, xb] of [[-7.3, -4.6], [-4.2, -1.4], [1.4, 4.2], [4.6, 7.3]]) { const g = mkShelfRow(xa, xb, W.z1 - 0.3, 2.6, false); }
  books.count = bi; books.instanceMatrix.needsUpdate = true; books.instanceColor.needsUpdate = true;
  lib.add(books);
  // posters
  const poster = (txt, bg, fg, x, y, z, ry) => { const p = plane(0.9, 1.2, new THREE.MeshBasicMaterial({ map: signTex(txt, bg, fg, 256, 340, 'bold 54px "Barlow Condensed"') })); p.position.set(x, y, z); p.rotation.y = ry; lib.add(p); };
  poster('READ!', '#d8a531', '#24384a', -2.6, 1.9, W.z0 + 0.12, 0);
  poster('BOOK FAIR', '#3c8d5a', '#fff', 2.4, 1.9, W.z0 + 0.12, 0);
  poster('SILENCE', '#24384a', '#f3e6c4', W.x1 - 0.11, 1.8, 2.4, -Math.PI / 2);
  // return cart
  const cart = new THREE.Group(); cart.position.set(-1.9, 0, -4.4); cart.rotation.y = 0.4; lib.add(cart);
  { const b = box(0.9, 0.5, 0.45, 0x4f6d7a, 0.01); b.position.y = 0.55; cart.add(b); for (const [x, z] of [[-0.38, -0.18], [0.38, -0.18], [-0.38, 0.18], [0.38, 0.18]]) { const w = sphere(0.06, 0x222222, 0.006, 10); w.position.set(x, 0.06, z); cart.add(w); } }
  return L;
}

export function buildTunnel(scene, origin) {
  const g = new THREE.Group(); g.position.copy(origin); scene.add(g);
  const pts = [];
  for (let i = 0; i <= 12; i++) pts.push(new THREE.Vector3(Math.sin(i * 0.5) * 1.2, -i * 1.6, -i * 2.4 + Math.cos(i * 0.4) * 0.8));
  const curve = new THREE.CatmullRomCurve3(pts);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 240, 0.55, 20, false), toon(0xffffff, { map: metalTex(), side: THREE.BackSide }));
  g.add(tube);
  for (let i = 0; i < 26; i++) {
    const t = i / 26; const p = curve.getPointAt(t); const tan = curve.getTangentAt(t);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.53, 0.035, 6, 24), toon(0x4a5058));
    ring.position.copy(p); ring.lookAt(p.clone().add(tan)); g.add(ring);
  }
  const lights = [];
  for (let i = 0; i < 4; i++) { const pl = new THREE.PointLight(0xff9a50, 3, 6, 1.5); pl.position.copy(curve.getPointAt(0.15 + i * 0.22)); g.add(pl); lights.push(pl); }
  return { group: g, curve, lights };
}

export function buildBasement(scene, origin) {
  const g = new THREE.Group(); g.position.copy(origin); scene.add(g);
  const cTex = concreteTex();
  const fl = plane(10, 10, toon(0xffffff, { map: cTex })); fl.rotation.x = -Math.PI / 2; g.add(fl);
  const ce = plane(10, 10, toon(0x8a8f96, { map: cTex })); ce.rotation.x = Math.PI / 2; ce.position.y = 3.0; g.add(ce);
  for (const [x, z, ry] of [[0, -5, 0], [0, 5, Math.PI], [-5, 0, Math.PI / 2], [5, 0, -Math.PI / 2]]) { const w = plane(10, 3, toon(0xa0a4aa, { map: cTex })); w.position.set(x, 1.5, z); w.rotation.y = ry; g.add(w); }
  // pipes across the ceiling
  for (const [z, r, c] of [[-1.5, 0.09, 0x7d6a55], [-1.2, 0.06, 0x5e6b78], [1.8, 0.11, 0x6d5c4a], [2.2, 0.05, 0x8c2f2f]]) { const p = cyl(r, r, 10, c, 0.01, 12); p.rotation.z = Math.PI / 2; p.position.set(0, 2.85 - r, z); g.add(p); }
  for (const [x, r] of [[-1.8, 0.07], [2.4, 0.05]]) { const p = cyl(r, r, 10, 0x5e6b78, 0.01, 12); p.rotation.x = Math.PI / 2; p.position.set(x, 2.75, 0); g.add(p); }
  // chute outlet + book pile we land in
  const out = box(0.9, 0.7, 0.6, 0x7d8791, 0.012); out.position.set(0, 1.6, 4.7); g.add(out);
  const hole = plane(0.6, 0.45, new THREE.MeshBasicMaterial({ color: 0x020203 })); hole.position.set(0, 1.55, 4.39); hole.rotation.y = Math.PI; g.add(hole);
  const r = RNG(77);
  for (let i = 0; i < 70; i++) {
    const b = box(0.2 + r() * 0.12, 0.04 + r() * 0.04, 0.28, [0xb83a3a, 0x2f6f9f, 0xd8a531, 0x3c8d5a, 0x7b4fb3, 0xe8e0c8][(r() * 6) | 0], 0.006);
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 1.1;
    b.position.set(Math.cos(a) * d, 0.03 + r() * (0.35 - d * 0.25), 3.8 + Math.sin(a) * d * 0.8); b.rotation.set(r() * 0.6, r() * 3, r() * 0.6); g.add(b);
  }
  // boxes, shelves, mop bucket
  for (const [x, z, s] of [[-3.6, -3.2, 0.8], [-3.0, -3.6, 0.6], [-3.4, -2.4, 0.5], [3.5, -3.8, 0.7]]) { const b = box(s, s, s, 0x9b7a4f, 0.012); b.position.set(x, s / 2, z); b.rotation.y = x * 0.3; g.add(b); }
  const bucket = cyl(0.25, 0.2, 0.4, 0xd8a531, 0.01); bucket.position.set(2.6, 0.2, 1.2); g.add(bucket);
  const win = plane(0.9, 0.35, new THREE.MeshBasicMaterial({ color: 0x3b5a8f })); win.position.set(-2, 2.6, -4.98); g.add(win);
  const moon = new THREE.SpotLight(0x7c9be0, 45, 14, 0.75, 0.6, 1); moon.position.set(-2, 2.6, -4.6); moon.target.position.set(0.3, 0, 0.8); g.add(moon); g.add(moon.target);
  // red emergency lamp on the far wall
  const em = box(0.3, 0.14, 0.12, 0xff2a2a, 0.008, { emissive: 0xff2020 }); em.position.set(2.2, 2.4, -4.9); g.add(em);
  const eml = new THREE.PointLight(0xff3030, 4, 7, 1.2); eml.position.set(2.2, 2.2, -4.5); g.add(eml);
  const bulb = sphere(0.07, 0x555555, 0.006, 10); bulb.position.set(-0.6, 2.4, -1.0); g.add(bulb);
  const wire = cyl(0.006, 0.006, 0.55, 0x111111, 0, 4); wire.position.set(-0.6, 2.72, -1.0); g.add(wire);
  return { group: g };
}
