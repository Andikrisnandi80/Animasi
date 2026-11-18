// The family from the photo, drawn in the skill's flat-card style (toon.ts Pen API, 600 x 1000 design canvas, soles at
// y = 975): bean heads, stick limbs with ink-dot hands, plum thick-thin outline, painted crescents, no blush.
// Seated on a sofa: hips ~1 head-height above the soles, shins straight down, a foreshortened lap.
import { Pen, INK, blobPts, headBlob, thickAngle, mul, mix, shade, faceFront, hatOn, curve, Expr, Blob, P2 } from "./toon";

type C3 = [number, number, number];
const SH_SKIN: C3 = [0.96, 0.86, 0.84];
const SH_CLOTH: C3 = [0.64, 0.66, 0.74];
const rad = (d: number) => (d * Math.PI) / 180;
const LIGHT = rad(-120);

export type Person = {
  build: "adult" | "kid";
  skin: string;
  shirt: string; // koko / tunic
  sleeve?: "short" | "long";
  pants: string;
  feet: string;
  skirt?: string; // long skirt (covers the legs)
  skirtPattern?: string;
  head: "peci" | "hair" | "hijab";
  hair?: string;
  hijab?: string;
  hijabLong?: boolean; // khimar down to the waist
  pocket?: boolean;
  goatee?: string;
  placket?: boolean;
  seed: number;
};

export const AYAH: Person = { build: "adult", skin: "#e8b98e", shirt: "#5b82b8", sleeve: "short", pants: "#8d93a3", feet: "#e8b98e", head: "peci",
  pocket: true, goatee: "#2a2020", placket: true, seed: 3 };
export const KAKAK: Person = { build: "adult", skin: "#efc39a", shirt: "#f6f5f0", sleeve: "long", pants: "#3b3b46", feet: "#2b2b33", head: "hair",
  hair: "#1d1718", placket: true, seed: 5 };
export const ADIK: Person = { build: "kid", skin: "#f3cba5", shirt: "#e9b9d4", sleeve: "long", pants: "#cdb8e6", feet: "#cdb8e6", head: "hijab",
  hijab: "#f28fb4", seed: 2 };
export const IBU: Person = { build: "adult", skin: "#efc39a", shirt: "#ddaab7", sleeve: "long", pants: "#ddaab7", feet: "#d9b3a0", head: "hijab",
  hijab: "#d99aac", hijabLong: true, skirt: "#4c2f40", skirtPattern: "#a8708a", seed: 6 };

export type Pose = {
  expr: Expr; blink: number; look?: number; facing?: -1 | 0 | 1; headTilt?: number; tilt?: number;
  /** right-hand wave: undefined = resting on the lap; otherwise 0..1 raise amount, `wag` = hand swing phase */
  wave?: { up: number; wag: number };
  /** left hand wave (screen-left arm) */
  waveL?: { up: number; wag: number };
  bounce?: number; // design units, + = up (whole body)
};

const B = { adult: { a: 118, torso: 1.1, tw: 0.82, seat: 1.0, shin: 0.9 }, kid: { a: 108, torso: 0.82, tw: 0.72, seat: 0.78, shin: 0.68 } };

export const drawPerson = (p: Pen, o: Person, s: Pose) => {
  const Bd = B[o.build], facing = s.facing ?? 0;
  const H = headBlob(o.seed, Bd.a, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const sole = 975, up = s.bounce ?? 0;
  const hipY = sole - Bd.seat * HH - up, torsoBot = hipY + 0.1 * HH;
  const chin = torsoBot - Bd.torso * HH, hc = chin - H.b;
  const thick = thickAngle(LIGHT), ow = 5 * u, legW = 6 * u, footW = 8 * u;
  const legCol = mix(o.pants, INK, 0.45), skinArm = mix(o.skin, INK, 0.25);
  const armCol = o.sleeve === "short" ? mix(o.shirt, INK, 0.35) : mix(o.shirt, INK, 0.3);
  p.rot = null;
  // ---- legs: shins straight down from the knees, feet turned out ----
  const kneeY = hipY + 0.16 * HH;
  if (o.skirt) {
    const sk: P2[] = [[300 - 46 * u, hipY - 0.05 * HH], [300 + 46 * u, hipY - 0.05 * HH], [300 + 50 * u, sole - 14 * u], [300 - 50 * u, sole - 14 * u]];
    p.gradFill(sk, o.skirt, mul(o.skirt, SH_CLOTH), LIGHT);
    p.clip(sk, () => { // batik: rows of diamonds + dots
      for (let r = 0; r < 9; r++) for (let c = -4; c <= 4; c++) {
        const x = 300 + c * 13 * u + (r % 2) * 6.5 * u, y = hipY + r * 12 * u;
        p.poly([[x, y - 4 * u], [x + 4 * u, y], [x, y + 4 * u], [x - 4 * u, y]], o.skirtPattern!, 0);
        p.dot(x + 6.5 * u, y + 6 * u, 1.3 * u, shade(o.skirtPattern!, 1.2));
      }
      p.band([[300 - 60 * u, sole - 30 * u], [300 + 60 * u, sole - 30 * u]], "#7a5a3a", 4 * u, 1 * u);
    });
    p.poly(sk, null, ow * 0.9);
    for (const side of [-1, 1]) {
      const fx = 300 + side * 18 * u;
      p.stroke([[fx - side * 4 * u, sole - 6 * u], [fx + side * 12 * u, sole - 4 * u]], footW + 3, INK);
      p.stroke([[fx - side * 4 * u, sole - 6 * u], [fx + side * 12 * u, sole - 4 * u]], footW, o.feet);
    }
  } else {
    for (const side of [-1, 1]) {
      const kx = 300 + side * 22 * u, fx = 300 + side * 26 * u, fy = sole - 5 * u;
      p.stroke([[kx, kneeY], [fx, fy]], legW, legCol);
      if (o.feet === o.skin) { p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + u]], footW + 3, INK); p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + u]], footW, o.feet); }
      else { p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + u]], footW + 3, INK); p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + u]], footW, o.feet); }
    }
    // lap: thighs seen end-on (a soft wide shape between hips and knees)
    const lap: P2[] = [];
    for (let i = 0; i <= 24; i++) { const t = (i / 24) * Math.PI * 2; lap.push([300 + 40 * u * Math.cos(t), (hipY + kneeY) / 2 + 0.12 * HH * Math.sin(t)]); }
    p.gradFill(lap, o.pants, mul(o.pants, SH_CLOTH), LIGHT);
  }
  // ---- upper body (tilts about the hips) ----
  const A = s.tilt ?? 0;
  p.rot = A ? [rad(A), 300, hipY] : null;
  const T: Blob = { a: ((Bd.tw / 2) * W) / 1.0, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.8, egg: 0.14, asym: 0.03 * facing, rot: 0, noise: 0.006, seed: o.seed + 7 };
  const tcx = 300 + 2 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const sh = (side: number): P2 => [tcx + side * 0.82 * T.a, chin + 0.14 * HH];
  // arms: resting hands on the lap, or waving
  const restArm = (side: number): [P2, P2, P2] => {
    const S = sh(side);
    return [S, [tcx + side * (1.08 * T.a + 6 * u), S[1] + 0.45 * HH], [tcx + side * 0.45 * T.a, hipY + 0.06 * HH]];
  };
  const waveArm = (side: number, w: { up: number; wag: number }): [P2, P2, P2] => {
    const [S, E0, H0] = restArm(side);
    const E1: P2 = [tcx + side * (1.15 * T.a + 16 * u), S[1] + 0.05 * HH];
    const H1: P2 = [tcx + side * (1.1 * T.a + 22 * u) + side * 12 * u * Math.sin(w.wag), S[1] - 0.55 * HH];
    const k = w.up;
    return [S, [E0[0] + (E1[0] - E0[0]) * k, E0[1] + (E1[1] - E0[1]) * k], [H0[0] + (H1[0] - H0[0]) * k, H0[1] + (H1[1] - H0[1]) * k]];
  };
  const arms: { pts: [P2, P2, P2]; front: boolean }[] = [
    { pts: s.waveL ? waveArm(-1, s.waveL) : restArm(-1), front: !s.waveL },
    { pts: s.wave ? waveArm(1, s.wave) : restArm(1), front: !s.wave },
  ];
  const drawArm = (a: { pts: [P2, P2, P2] }) => {
    const c = curve(a.pts[0], a.pts[1], a.pts[2]);
    if (o.sleeve === "short") { const m = Math.floor(c.length * 0.45); p.stroke(c.slice(0, m + 1), 9 * u, armCol); p.stroke(c.slice(m), 5.4 * u, skinArm); }
    else p.stroke(c, 5.6 * u, armCol);
    p.dot(a.pts[2][0], a.pts[2][1], 6 * u);
  };
  for (const a of arms) if (!a.front) drawArm(a);
  // torso: long koko / tunic over the lap
  p.gradFill(tp, o.shirt, mul(o.shirt, SH_CLOTH), LIGHT);
  p.clip(tp, () => {
    if (o.placket) {
      p.stroke([[tcx, chin + 0.04 * HH], [tcx, chin + 0.5 * HH]], 1.6 * u, shade(o.shirt, 0.72));
      for (let i = 0; i < 3; i++) { const y = chin + 0.12 * HH + i * 0.13 * HH; p.dot(tcx + 3 * u, y, 2.6 * u, INK); p.dot(tcx + 3 * u, y, 1.8 * u, shade(o.shirt, 0.85)); }
    }
    if (o.pocket) { const x = tcx + 0.45 * T.a, y = chin + 0.28 * HH; p.poly([[x - 9 * u, y], [x + 9 * u, y], [x + 9 * u, y + 13 * u], [x - 9 * u, y + 13 * u]], null, 1.4 * u); }
    if (o.shirt === "#f6f5f0") p.band([[tcx - 1.2 * T.a, chin + 0.02 * HH], [tcx + 1.2 * T.a, chin + 0.02 * HH]], "#e9e7df", 0.07 * HH, 0);
  });
  p.inkRing(tp, ow, thick);
  if (!o.head.startsWith("hij")) { // mandarin collar
    p.poly([[tcx - 13 * u, chin - 2 * u], [tcx + 13 * u, chin - 2 * u], [tcx + 12 * u, chin + 6 * u], [tcx - 12 * u, chin + 6 * u]], shade(o.shirt, 0.92), 1.8 * u);
  }
  // hijab drape over the shoulders and chest (khimar: down to the waist)
  if (o.head === "hijab") {
    const len = o.hijabLong ? 0.95 : 0.6;
    const D: Blob = { a: (o.hijabLong ? 0.58 : 0.5) * W, b: 0.5 * (len * HH + 0.5 * HH), nTop: 2.0, nBot: 2.6, egg: 0.22, asym: 0, rot: 0, noise: 0.006, seed: o.seed + 9 };
    const dp = blobPts(300, chin - 0.25 * HH + D.b, D);
    p.gradFill(dp, o.hijab!, mul(o.hijab!, SH_CLOTH), LIGHT);
    p.stroke(curve([300 - 20 * u, chin + 0.25 * HH], [300 - 4 * u, chin + 0.45 * HH], [300 - 10 * u, chin + 0.65 * HH]), 1.4 * u, shade(o.hijab!, 0.75));
    p.stroke(curve([300 + 26 * u, chin + 0.2 * HH], [300 + 14 * u, chin + 0.42 * HH], [300 + 22 * u, chin + 0.6 * HH]), 1.4 * u, shade(o.hijab!, 0.75));
    if (o.hijabLong) p.dot(300 + 6 * u, chin + 0.36 * HH, 2.4 * u, "#c9c9cf"); // brooch pin
    p.inkRing(dp, ow, thick);
  }
  for (const a of arms) if (a.front) drawArm(a);
  // ---- head ----
  const Ah = A + (s.headTilt ?? 0);
  p.rot = Ah ? [rad(Ah), 300, chin] : null;
  if (o.head === "hijab") { // back of the hijab, wider than the head
    const hb = blobPts(300, hc - 0.04 * HH, { ...H, a: H.a * 1.2, b: H.b * 1.16, asym: 0, egg: 0.1, seed: H.seed + 3 });
    p.shadedFill(hb, o.hijab!, mul(o.hijab!, SH_CLOTH), LIGHT, H.a * 1.2);
    p.inkRing(hb, ow * 0.9, thick);
  }
  const hp = blobPts(300, hc, H);
  p.shadedFill(hp, o.skin, mul(o.skin, SH_SKIN), LIGHT, H.a);
  p.inkRing(hp, ow, thick);
  if (o.head === "hair") hatOn(p, { jacket: o.shirt, pants: o.pants, boots: o.feet, hat: "hair", hair: o.hair }, hp, H, 300, hc, LIGHT, o.seed, facing, false);
  if (o.head === "hijab") { // front frame of the hijab around the face: outer blob minus the face oval
    const fcY = hc + 0.16 * H.b, fa = 0.8 * H.a, fb = 0.84 * H.b;
    const outer = blobPts(300, hc - 0.04 * HH, { ...H, a: H.a * 1.2, b: H.b * 1.16, asym: 0, egg: 0.1, seed: H.seed + 3 });
    const g = p.g; g.save();
    p.path(outer, true);
    const face: P2[] = []; for (let i = 0; i <= 48; i++) { const t = (-i / 48) * Math.PI * 2; face.push([300 + fa * Math.cos(t), fcY + fb * Math.sin(t) * (Math.sin(t) < 0 ? 1 : 1.05)]); }
    p.g.beginPath();
    outer.forEach((q, i) => { const [x, y] = p.P(q[0], q[1]); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath();
    face.forEach((q, i) => { const [x, y] = p.P(q[0], q[1]); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath();
    const [gx, gy] = p.P(300 - 30 * u, hc - 40 * u);
    const gr = g.createRadialGradient(gx, gy, 0, gx, gy, 1.5 * H.a);
    gr.addColorStop(0, o.hijab!); gr.addColorStop(0.75, o.hijab!); gr.addColorStop(1, mul(o.hijab!, SH_CLOTH));
    g.fillStyle = gr; g.fill("evenodd"); g.restore();
    p.poly(face, null, 3 * u);
    p.inkRing(outer, ow, thick);
    // fold line across the forehead
    p.arc(300, fcY - fb + 4 * u, fa * 0.9, 8 * u, 200, 340, 1.4 * u, shade(o.hijab!, 0.78));
  }
  faceFront(p, 300, hc + (o.head === "hijab" ? 0.12 * H.b : 0), W, s.expr, facing, s.look ?? 0, s.blink, o.head === "peci", o.skin);
  if (o.goatee) { const mx = 300 + 8 * u * facing; p.poly([[mx - 5 * u, hc + 0.8 * H.b], [mx + 5 * u, hc + 0.8 * H.b], [mx + 2 * u, hc + 0.98 * H.b], [mx - 2 * u, hc + 0.98 * H.b]], o.goatee, 0); }
  if (o.head === "peci") { // white kopiah: a short drum on the crown, tilted with the head
    const crown = hc - H.b, yb = crown + 0.3 * HH, ht = 0.24 * HH, wb = 0.47 * W, wt = 0.42 * W;
    const pc: P2[] = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12; pc.push([300 + wb * (2 * t - 1), yb + 4 * u * (1 - (2 * t - 1) ** 2)]); }
    pc.reverse(); pc.push([300 - wt, yb - ht + 3 * u], [300 - wt + 5 * u, yb - ht], [300 + wt - 5 * u, yb - ht], [300 + wt, yb - ht + 3 * u]);
    p.shadedFill(pc, "#f7f6f1", "#cfd2dc", LIGHT, wt, 0.4);
    p.clip(pc, () => { for (let r = 0; r < 4; r++) for (let c = -7; c <= 7; c++) p.dot(300 + c * 6 * u + (r % 2) * 3 * u, yb - ht + 6 * u + r * 6 * u, 0.9 * u, "#d9dbe2"); });
    p.poly(pc, null, ow * 0.85);
  }
  p.rot = null;
};

/** peach dahlia in a gold vase (an ink drawing on an fx card, 600 x 800 units) */
export const drawBouquet = (p: Pen, sway: number) => {
  const vase: P2[] = [[255, 790], [345, 790], [355, 600], [370, 560], [230, 560], [245, 600]];
  p.poly(vase, "#d9a93e", 6);
  p.clip(vase, () => { for (let i = -6; i < 8; i++) { p.stroke([[220 + i * 22, 560], [300 + i * 22, 800]], 3, "#a97a22"); p.stroke([[380 + i * 22 - 160, 800], [460 + i * 22 - 160, 560]], 3, "#a97a22"); } });
  p.poly(vase, null, 6);
  const heads: [number, number, number][] = [[300, 250, 78], [175, 330, 66], [430, 300, 70], [255, 410, 62], [385, 440, 58], [120, 470, 50], [480, 470, 48]];
  for (const [x, y, r] of heads) p.stroke(curve([300, 560], [(300 + x) / 2 + sway * 10, (560 + y) / 2], [x + sway * 14, y]), 6, "#6f8a52");
  for (const [lx, ly, a] of [[200, 520, -30], [420, 520, 30], [140, 400, -50], [470, 380, 40]] as const)
    p.ell(lx + sway * 8, ly, 46, 14, "#8aa36a", 4, 0, 360, a);
  heads.forEach(([x0, y, r], k) => {
    const x = x0 + sway * 14;
    for (let ring = 0; ring < 3; ring++) {
      const n = 14 - ring * 3, rr = r * (1 - ring * 0.3);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * 360 + ring * 13 + k * 7;
        p.ell(x + Math.cos(rad(a)) * rr * 0.55, y + Math.sin(rad(a)) * rr * 0.55, rr * 0.46, rr * 0.17, ring === 2 ? "#f6b893" : ring === 1 ? "#f8c6a3" : "#fbd6b8", 2.5, 0, 360, a);
      }
    }
    p.dot(x, y, r * 0.16, "#e79a6e");
  });
};

/** a sparkle / petal for the ending */
export const drawSparkle = (p: Pen, col: string) => {
  const pts: P2[] = [];
  for (let i = 0; i < 8; i++) { const r = i % 2 ? 22 : 90, a = (i / 8) * Math.PI * 2 - Math.PI / 2; pts.push([100 + r * Math.cos(a), 100 + r * Math.sin(a)]); }
  p.poly(pts, col, 7);
};
export const drawPetal = (p: Pen, col: string) => { p.ell(100, 100, 80, 34, col, 6, 0, 360, 20); };
export const drawHeart = (p: Pen, col: string) => {
  const pts: P2[] = [];
  for (let i = 0; i <= 60; i++) { const t = (i / 60) * Math.PI * 2; pts.push([100 + 5.2 * 16 * Math.sin(t) ** 3 * 0.9, 105 - 5.2 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 0.9]); }
  p.poly(pts, col, 7);
};
