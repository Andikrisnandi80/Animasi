// Shot plan: 15 s, 30 fps, 1080 x 1920. Four shots; glides are smootherstep, every hold creeps in.
export const FPS = 30;
export const TOTAL = 450;
export type V3 = [number, number, number];
export const smooth = (x: number) => { const t = Math.min(1, Math.max(0, x)); return t * t * t * (t * (6 * t - 15) + 10); };
const L = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const creep = (pos: V3, look: V3, k: number): V3 => L(pos, look, k); // push toward the look target

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export type Shot = { id: number; a: number; b: number; cam: (f: number) => Cam; dof: (f: number) => { cInf: number; focus?: V3 } };

// seat line (characters' card plane) z = -0.5; faces ~0.95 m (adults), ~0.75 m (kid)
export const SHOTS: Shot[] = [
  { // 1. establishing: the photo's framing, descending glide from high and far
    id: 1, a: 0, b: 100,
    cam: (f) => {
      const t = smooth(f / 90);
      const pos = L([0.5, 2.6, 7.4], [0.05, 1.3, 5.3], t), look = L([0, 1.6, -1.2], [0, 1.15, -1.2], t);
      return { pos: creep(pos, look, 0.0012 * Math.max(0, f - 85)), look, fov: 50, roll: 0 };
    },
    dof: () => ({ cInf: 0 }),
  },
  { // 2. Ayah + Kakak: Ayah waves, Kakak laughs
    id: 2, a: 100, b: 190,
    cam: (f) => {
      const k = f - 100, t = smooth(k / 30);
      const pos = L([-0.95, 1.02, 2.75], [-0.76, 1.0, 2.65], t), look: V3 = [-0.75, 0.86, -0.27];
      return { pos: creep(pos, look, 0.0025 * k), look, fov: 48, roll: -1.5 + 1.5 * t };
    },
    dof: () => ({ cInf: 11, focus: [-0.75, 0.95, -0.27] }),
  },
  { // 3. Adik + Ibu: Adik bounces and waves, Ibu leans in
    id: 3, a: 190, b: 285,
    cam: (f) => {
      const k = f - 190, t = smooth(k / 30);
      const pos = L([0.75, 0.92, 2.95], [0.6, 0.92, 2.85], t), look: V3 = [0.6, 0.8, -0.27];
      return { pos: creep(pos, look, 0.0028 * k), look, fov: 47, roll: 1.5 - 1.5 * t };
    },
    dof: () => ({ cInf: 12, focus: [0.62, 0.85, -0.27] }),
  },
  { // 4. from the flowers back to the whole family: everyone waves, hearts rise
    id: 4, a: 285, b: 450,
    cam: (f) => {
      const k = f - 285, t = smooth(k / 45);
      const pos = L([0.05, 0.98, 1.45], [-0.05, 1.3, 5.7], t), look = L([0.0, 0.78, 0.5], [0, 1.08, -1.2], t);
      return { pos: creep(pos, look, 0.0006 * Math.max(0, k - 45)), look, fov: L([40, 0, 0], [54, 0, 0], t)[0], roll: 0 };
    },
    dof: (f) => {
      const t = smooth((f - 285) / 40);
      return { cInf: 12 * (1 - t), focus: L([0, 0.85, 0.55], [0, 0.9, -0.27], t) };
    },
  },
];
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
/** impact shakes: flip sign every frame, decay over 7 f */
export const KICKS: [number, number][] = [[146, 0.012], [238, 0.01]];
export const kickAt = (f: number) => KICKS.reduce((a, [k, amp]) => (f >= k && f < k + 7 ? a + amp * (1 - (f - k) / 7) * (f % 2 ? 1 : -1) : a), 0);

// ---- acting: per-character pose over time ----
import type { Pose } from "./people";
const blinkAt = (f: number, seed: number) => { // blinks every 0.5-2.3 s, 4 frames long
  let t = 7 + seed * 5;
  while (t < TOTAL) {
    if (f >= t && f < t + 4) return [0.5, 1, 1, 0.5][f - t];
    t += 15 + Math.floor((Math.sin(t * 12.9898 + seed * 78.233) * 0.5 + 0.5) * 54);
  }
  return 0;
};
const env = (f: number, a: number, b: number, ramp = 8) => Math.min(smooth((f - a) / ramp), 1 - smooth((f - (b - ramp)) / ramp));
const ALLWAVE = 318;

export const poseAt = (who: "ayah" | "kakak" | "adik" | "ibu", f: number): Pose => {
  const s = { ayah: 1, kakak: 2, adik: 3, ibu: 4 }[who];
  const p: Pose = { expr: "smile", blink: blinkAt(f, s), look: 0 };
  const end = env(f, ALLWAVE, 999, 10);
  if (who === "ayah") {
    const w = env(f, 112, 182, 10);
    if (w > 0) { p.wave = { up: w, wag: (f - 112) * 0.55 }; p.expr = "grin"; }
    if (f >= 100 && f < 112) p.look = 0.6;
    if (end > 0) { p.wave = { up: end, wag: (f - ALLWAVE) * 0.5 }; p.expr = "grin"; }
    p.tilt = -2 * w;
  }
  if (who === "kakak") {
    if (f >= 140 && f < 175) { p.expr = "laugh"; p.headTilt = 3 * Math.sin((f - 140) * 0.6) * (1 - (f - 140) / 35); }
    else if (f >= 112 && f < 190) { p.expr = "grin"; p.look = -0.7; }
    if (end > 0) { p.waveL = { up: end, wag: (f - ALLWAVE) * 0.5 + 1.5 }; p.expr = "grin"; }
  }
  if (who === "adik") {
    const w = env(f, 205, 280, 8);
    if (w > 0) { p.wave = { up: w, wag: (f - 205) * 0.7 }; p.expr = "relief_open"; }
    const hop = f >= 222 && f < 262 ? Math.abs(Math.sin(((f - 222) / 20) * Math.PI)) : 0;
    p.bounce = 26 * hop;
    if (end > 0) { p.wave = { up: end, wag: (f - ALLWAVE) * 0.7 }; p.waveL = { up: end, wag: (f - ALLWAVE) * 0.7 + 2 }; p.expr = "relief_open"; p.bounce = 18 * Math.abs(Math.sin(((f - ALLWAVE) / 18) * Math.PI)); }
  }
  if (who === "ibu") {
    const lean = env(f, 228, 285, 12);
    p.tilt = -4 * lean; p.headTilt = -6 * lean;
    if (lean > 0.3) p.expr = "smile_closed";
    if (f >= 190 && f < 228) p.look = -0.6;
    if (end > 0) { p.wave = { up: end, wag: (f - ALLWAVE) * 0.5 + 0.8 }; p.expr = "grin"; }
  }
  return p;
};
export const HEARTS_AT = 330;
