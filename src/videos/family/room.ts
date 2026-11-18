// The living room from the photo as a painted toon set: dark wood tall cabinets (left), a fridge niche, a glass
// cabinet, cream kitchen cabinets with a dish rack (right), a white ceiling with recessed downlights, a beige sofa and
// a round white marble table with the gold vase of peach dahlias and a wooden tissue box in front.
// World materials are two-tone (shade.ts); the family are lit cards (cardshade.ts) on the NOINK layer.
import * as THREE from "three";
import { twoTone, TONE, CHAR, untone } from "./shade";
import { cardShade, CARD_K } from "./cardshade";
import { NOINK } from "./ink";
import { Pen } from "./toon";
import { drawPerson, drawBouquet, drawHeart, drawSparkle, AYAH, KAKAK, ADIK, IBU, Person } from "./people";
import { poseAt, HEARTS_AT, V3 } from "./story";

const SU = 0.00216; // metres per design unit (1000 units = 2.16 m)

// ---------------- painted textures ----------------
const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, rep: [number, number] = [1, 1]) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]);
  return t;
};
const rng = (s: number) => () => { s = (s * 16807) % 2147483647; return s / 2147483647; };

const woodPanels = (cols: number, rows: number) => canvasTex(1024, 1024, (g) => {
  g.fillStyle = "#5b4b42"; g.fillRect(0, 0, 1024, 1024);
  const r = rng(7);
  for (let i = 0; i < 260; i++) { // vertical grain streaks
    const x = r() * 1024, w = 1 + r() * 4;
    g.fillStyle = r() < 0.5 ? "rgba(40,30,26,0.35)" : "rgba(120,100,88,0.22)";
    g.fillRect(x, 0, w, 1024);
  }
  g.fillStyle = "#1c1513"; // panel seams painted in as dark lines
  for (let c = 0; c <= cols; c++) g.fillRect((c * 1024) / cols - 3, 0, 6, 1024);
  for (let rr = 0; rr <= rows; rr++) g.fillRect(0, (rr * 1024) / rows - 3, 1024, 6);
});
const creamPanels = (cols: number, rows: number) => canvasTex(1024, 1024, (g) => {
  g.fillStyle = "#e6dcd6"; g.fillRect(0, 0, 1024, 1024);
  g.fillStyle = "#8e807a";
  for (let c = 0; c <= cols; c++) g.fillRect((c * 1024) / cols - 2, 0, 4, 1024);
  for (let rr = 0; rr <= rows; rr++) g.fillRect(0, (rr * 1024) / rows - 2, 1024, 4);
});
const marble = canvasTex(1024, 1024, (g) => {
  g.fillStyle = "#f1f2f2"; g.fillRect(0, 0, 1024, 1024);
  const r = rng(3);
  for (let i = 0; i < 9; i++) {
    g.strokeStyle = `rgba(110,115,125,${0.25 + r() * 0.35})`; g.lineWidth = 1 + r() * 3;
    g.beginPath(); let x = r() * 1024, y = r() * 1024; g.moveTo(x, y);
    for (let k = 0; k < 12; k++) { x += (r() - 0.3) * 140; y += (r() - 0.5) * 120; g.lineTo(x, y); }
    g.stroke();
  }
});
const tiles = canvasTex(1024, 1024, (g) => {
  g.fillStyle = "#d8d0c4"; g.fillRect(0, 0, 1024, 1024);
  const r = rng(11);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = `rgba(255,255,255,${r() * 0.12})`; g.fillRect(i * 256, j * 256, 256, 256); }
  g.fillStyle = "#a59a8c";
  for (let i = 0; i <= 4; i++) { g.fillRect(i * 256 - 2, 0, 4, 1024); g.fillRect(0, i * 256 - 2, 1024, 4); }
}, [3, 3]);
const leather = canvasTex(512, 512, (g) => {
  g.fillStyle = "#cdbb9c"; g.fillRect(0, 0, 512, 512);
  const r = rng(5);
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(90,70,50,${r() * 0.06})`; g.fillRect(r() * 512, r() * 512, 3, 3); }
});
const dishRack = canvasTex(1024, 256, (g) => {
  g.fillStyle = "#e9e6e2"; g.fillRect(0, 0, 1024, 256);
  const cols = ["#3f6fb5", "#c94f45", "#e8e2d6", "#7a6a5a", "#d9a441", "#2f5f6a", "#f2f0ea", "#8c3b4a"];
  for (let i = 0; i < 22; i++) {
    g.fillStyle = cols[i % 8]; g.beginPath(); g.ellipse(40 + i * 45, 128, 20, 90, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#1b1416"; g.lineWidth = 4; g.stroke();
  }
  g.fillStyle = "#9a9a9a"; g.fillRect(0, 210, 1024, 10);
});
const glassCab = canvasTex(256, 1024, (g) => {
  g.fillStyle = "#c9d3d0"; g.fillRect(0, 0, 256, 1024);
  g.fillStyle = "#7d8784"; for (const y of [250, 500, 750]) g.fillRect(0, y, 256, 8);
  const items = ["#d9a441", "#4a4a4a", "#e8e2d6", "#b5653f", "#7b5ac9"];
  for (let s = 0; s < 3; s++) for (let i = 0; i < 4; i++) {
    g.fillStyle = items[(s * 4 + i) % 5]; const x = 25 + i * 55, y = 250 * (s + 1) - 70 - (i % 2) * 20;
    g.fillRect(x, y, 34, 250 * (s + 1) - y); g.strokeStyle = "#1b1416"; g.lineWidth = 4; g.strokeRect(x, y, 34, 250 * (s + 1) - y);
  }
  g.strokeStyle = "#f4f4f4"; g.lineWidth = 6; g.strokeRect(6, 6, 244, 1012);
});

// ---------------- materials ----------------
const lam = (color: THREE.ColorRepresentation, map?: THREE.Texture) => twoTone(new THREE.MeshLambertMaterial({ color, map: map ?? null }));
const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D) => {
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  b.position.set(x, y + h / 2, z); b.castShadow = true; b.receiveShadow = true; parent.add(b); return b;
};
/** a box whose front face carries the given map (sides plain) */
const faced = (w: number, h: number, d: number, side: THREE.Material, front: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D) => {
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [side, side, side, side, front, side]);
  b.position.set(x, y + h / 2, z); b.castShadow = true; b.receiveShadow = true; parent.add(b); return b;
};
const rounded = (w: number, h: number, d: number, r: number) => {
  const s = new THREE.Shape(); const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 3, curveSegments: 8 });
  g.translate(0, 0, -d / 2); g.computeVertexNormals(); return g;
};

// ---------------- cards ----------------
class Card {
  mesh: THREE.Mesh; canvas: HTMLCanvasElement; tex: THREE.CanvasTexture; mat: THREE.MeshLambertMaterial; key = ""; maxYaw = 0.3;
  constructor(parent: THREE.Object3D, cw: number, ch: number, w: number, h: number, lit = true, bottomAt = 0) {
    this.canvas = document.createElement("canvas"); this.canvas.width = cw; this.canvas.height = ch;
    this.tex = new THREE.CanvasTexture(this.canvas); this.tex.colorSpace = THREE.SRGBColorSpace; this.tex.anisotropy = 8;
    const geo = new THREE.PlaneGeometry(w, h); geo.translate(0, h / 2 - bottomAt, 0);
    this.mat = lit ? cardShade(new THREE.MeshLambertMaterial({ map: this.tex, alphaTest: 0.5, side: THREE.DoubleSide }))
      : new THREE.MeshBasicMaterial({ map: this.tex, alphaTest: 0.5, side: THREE.DoubleSide }) as unknown as THREE.MeshLambertMaterial;
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.layers.set(NOINK); this.mesh.receiveShadow = lit; this.mesh.renderOrder = 1;
    if (lit) this.mesh.onBeforeRender = (r) => { const rt = r.getRenderTarget(); CARD_K.uPx.value = (rt ? rt.height : r.domElement.height) / 1920; };
    parent.add(this.mesh);
  }
  draw(key: string, fn: (p: Pen) => void, scale: number) {
    if (key === this.key) return;
    this.key = key;
    const g = this.canvas.getContext("2d")!;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, this.canvas.width, this.canvas.height);
    g.setTransform(scale, 0, 0, scale, 0, 0);
    fn(new Pen(g));
    this.tex.needsUpdate = true;
  }
  face(cam: THREE.Vector3) { // camera-facing about the vertical axis
    const a = Math.atan2(cam.x - this.mesh.position.x, cam.z - this.mesh.position.z);
    this.mesh.rotation.y = Math.max(-this.maxYaw, Math.min(this.maxYaw, a));
  }
}

type Who = "ayah" | "kakak" | "adik" | "ibu";
const CAST: [Who, Person, number][] = [["ayah", AYAH, -1.12], ["kakak", KAKAK, -0.38], ["adik", ADIK, 0.3], ["ibu", IBU, 0.98]];
export const SEAT_Z = -0.27;

export class Room {
  root = new THREE.Group();
  sun = new THREE.DirectionalLight("#fff4e6", 2.4);
  people: { who: Who; o: Person; card: Card }[] = [];
  bouquet: Card; sparks: { card: Card; x: number; z: number; t0: number; kind: number; spd: number }[] = [];
  lamps: THREE.Mesh[] = [];
  constructor() {
    const R = this.root;
    // lights: one key "sun" (the room light from front-left, above) + hemisphere for the few unpatched materials
    this.sun.position.set(-2.5, 4.5, 4.5); this.sun.target.position.set(0, 0.6, -0.8);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(2048, 2048);
    const sc = this.sun.shadow.camera; sc.left = -4; sc.right = 4; sc.top = 4; sc.bottom = -4; sc.near = 0.5; sc.far = 15;
    this.sun.shadow.bias = -0.0004; this.sun.shadow.normalBias = 0.02;
    R.add(this.sun, this.sun.target, new THREE.HemisphereLight("#fff6ea", "#b8a690", 0.8));
    // two-tone look for an indoor key: warm lit side, soft lilac-grey shade (no crushed blacks)
    TONE.uLitCol.value.set(1.42, 1.36, 1.24); TONE.uShadeCol.value.set(0.76, 0.73, 0.78); TONE.uShadeLift.value.set(0.04, 0.04, 0.07);
    TONE.uLambert.value = 0.3; TONE.uSideK.value = 0.86; TONE.uTerm.value = 0.25; TONE.uSat.value = 1.06;
    CHAR.uCharTint.value.set(1.0, 0.96, 0.93); CHAR.uCharShade.value = 0.88; CHAR.uGrad.value = 0.07; CHAR.uBodyGrad.value = 0.2;

    // shell: floor, back wall, left wall, ceiling with a dropped soffit
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 14), lam("#ffffff", tiles)); floor.rotation.x = -Math.PI / 2; floor.position.z = 2; floor.receiveShadow = true; R.add(floor);
    const H = 3.1, BZ = -1.95;
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(12, H), lam("#ece6df")); wall.position.set(0, H / 2, BZ - 0.31); wall.receiveShadow = true; R.add(wall);
    const lw = new THREE.Mesh(new THREE.PlaneGeometry(14, H), lam("#efebe6")); lw.rotation.y = Math.PI / 2; lw.position.set(-2.75, H / 2, 2); lw.receiveShadow = true; R.add(lw);
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(12, 14), lam("#f4f2ee")); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, H, 2); R.add(ceil);
    box(5.6, 0.22, 2.2, lam("#f2f0ec"), -0.2, H - 0.22, 2.4, R); // soffit band like the photo's ceiling step
    // recessed downlights (HDR emissive -> bloom)
    for (const [x, z] of [[-1.6, 1.2], [1.6, 1.2], [-1.6, 3.6], [1.6, 3.6], [0, -0.9]] as const) {
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 24), new THREE.MeshBasicMaterial({ color: "#2b2b2b" }));
      const y = z > 2 || Math.abs(x) > 1 ? H - 0.235 : H - 0.015;
      ring.position.set(x, y, z); R.add(ring);
      const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.035, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.0, 1.7) }));
      lamp.position.set(x, y - 0.006, z); R.add(lamp); this.lamps.push(lamp);
    }
    // left: tall dark wood cabinets with a fridge niche
    const woodSide = lam("#4a3d36");
    faced(2.25, 2.75, 0.6, woodSide, lam("#ffffff", woodPanels(4, 2)), -1.6, 0, BZ, R);
    const fridge = faced(0.9, 1.9, 0.62, lam("#2a2324"), lam("#3a3133"), -0.05, 0, BZ + 0.02, R);
    faced(0.9, 0.85, 0.6, woodSide, lam("#ffffff", woodPanels(2, 1)), -0.05, 1.9, BZ, R);
    box(0.02, 1.2, 0.02, lam("#c9c9c9"), 0.12, 0.5, BZ + 0.34, R); // fridge handle
    void fridge;
    // right: glass cabinet, cream counter + upper cabinets, dish rack
    faced(0.5, 2.0, 0.55, lam("#e9e4df"), lam("#ffffff", glassCab), 0.72, 0, BZ, R);
    faced(2.2, 0.9, 0.58, lam("#e6dcd6"), lam("#ffffff", creamPanels(4, 1)), 2.08, 0, BZ, R);
    box(2.25, 0.04, 0.62, lam("#3a3536"), 2.08, 0.9, BZ, R); // counter top
    faced(1.4, 0.32, 0.32, lam("#dedad6"), lam("#ffffff", dishRack), 2.2, 1.28, BZ - 0.1, R);
    faced(2.7, 0.85, 0.4, lam("#e6dcd6"), lam("#ffffff", creamPanels(4, 1)), 2.33, 2.0, BZ - 0.05, R);
    faced(2.2, 0.7, 0.05, lam("#e6dcd6"), lam("#ffffff", creamPanels(1, 1)), 2.08, 0.94, BZ - 0.28, R); // backsplash
    // counter clutter: canisters + a utensil pot
    const cl = ["#d9a441", "#4a7fb5", "#c94f45", "#e8e2d6"];
    for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.16 + (i % 2) * 0.06, 16), lam(cl[i])); c.position.set(1.35 + i * 0.16, 1.0, BZ + 0.05); c.castShadow = true; R.add(c); }
    // sofa: seat, back, arms (beige leather)
    const leatherM = lam("#ffffff", leather);
    const seat = new THREE.Mesh(rounded(3.5, 0.4, 0.8, 0.06), leatherM); seat.position.set(0, 0.26, -1.0);
    seat.castShadow = seat.receiveShadow = true; R.add(seat);
    box(3.5, 0.06, 0.85, lam("#5a4a40"), 0, 0, -1.0, R); // plinth
    for (let i = 0; i < 3; i++) box(1.12, 0.12, 0.8, leatherM, -1.15 + i * 1.15, 0.47, -0.98, R); // seat cushions
    for (let i = 0; i < 3; i++) { const b = box(1.12, 0.62, 0.24, leatherM, -1.15 + i * 1.15, 0.5, -1.38, R); b.rotation.x = -0.12; }
    box(0.3, 0.72, 0.95, leatherM, -1.95, 0.0, -1.0, R); box(0.3, 0.72, 0.95, leatherM, 1.95, 0.0, -1.0, R);
    // round marble table with a gold rim, bouquet + tissue box
    const T = new THREE.Group(); T.position.set(0.05, 0, 0.55); R.add(T);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.05, 64), [lam("#d8d8d8"), lam("#ffffff", marble), lam("#d8d8d8")]);
    top.position.y = 0.5; top.castShadow = top.receiveShadow = true; T.add(top);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.012, 8, 64), lam("#c4953f")); rim.rotation.x = Math.PI / 2; rim.position.y = 0.475; T.add(rim);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 0.48, 32), lam("#c4953f")); leg.position.y = 0.24; leg.castShadow = true; T.add(leg);
    const tray = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.06, 32), lam("#d4c6a0")); tray.position.set(-0.05, 0.555, 0.05); T.add(tray);
    const tb = box(0.26, 0.12, 0.13, lam("#c79a5e"), 0.38, 0.525, 0.22, T); tb.rotation.y = -0.4;
    const tissue = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.08, 6), lam("#ffffff")); tissue.position.set(0.38, 0.69, 0.22); T.add(tissue);
    // the family + the bouquet (cards)
    for (const [who, o, x] of CAST) {
      const card = new Card(R, 900, 1500, 600 * SU, 1000 * SU, true, 25 * SU);
      card.mesh.position.set(x, 0, SEAT_Z + (who === "adik" ? -0.05 : 0));
      this.people.push({ who, o, card });
    }
    this.bouquet = new Card(R, 600, 800, 0.5, 0.667, true, 10 / 800 * 0.667);
    this.bouquet.mesh.position.set(0.0, 0.555, 0.6);
    // hearts / sparkles for the ending (unlit, so they stay bright)
    const r = rng(21);
    for (let i = 0; i < 16; i++) {
      const c = new Card(R, 200, 200, 0.16, 0.16, false, 0);
      c.draw("k" + (i % 3), (p) => (i % 3 === 0 ? drawSparkle(p, "#ffe08a") : drawHeart(p, i % 3 === 1 ? "#ff8fb1" : "#ff6f8f")), 1);
      c.mesh.visible = false;
      this.sparks.push({ card: c, x: -1.6 + r() * 3.2, z: -0.3 + r() * 0.9, t0: HEARTS_AT + Math.floor(r() * 90), kind: i % 3, spd: 0.012 + r() * 0.01 });
    }
  }
  update(f: number, cam: THREE.PerspectiveCamera) {
    for (const { who, o, card } of this.people) {
      const s = poseAt(who, f);
      const key = JSON.stringify(s, (_k, v) => (typeof v === "number" ? Math.round(v * 50) / 50 : v));
      card.draw(key, (p) => drawPerson(p, o, s), 1.5);
      card.face(cam.position);
    }
    const sway = 0.15 * Math.sin(f * 0.08);
    this.bouquet.draw("b" + sway.toFixed(3), (p) => drawBouquet(p, sway), 1);
    this.bouquet.face(cam.position);
    for (const s of this.sparks) {
      const k = f - s.t0;
      s.card.mesh.visible = k >= 0 && k < 110;
      if (!s.card.mesh.visible) continue;
      s.card.mesh.position.set(s.x + 0.06 * Math.sin(k * 0.12 + s.x * 5), 1.45 + k * s.spd, s.z);
      const pop = Math.min(1, k / 6) * (1 - Math.max(0, (k - 95) / 15));
      s.card.mesh.scale.setScalar(0.4 + 0.8 * pop);
      s.card.mesh.lookAt(cam.position);
      s.card.mesh.rotateZ(0.3 * Math.sin(k * 0.1 + s.z * 9));
    }
  }
}
export const BG = untone("#efe9e2");
export type { V3 };
