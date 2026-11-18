// "Keluarga di Ruang Tamu": a 15 s vertical cartoon of the family photo, in the flat-cards-in-a-3D-toon-world style.
// Post chain as in the skill: InkPass (world only) -> lens blur pre + main -> bloom (emissive) -> NEUTRAL tone map ->
// grade, MSAA 4. Pixel-sized parameters scale with output height / 1920.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, getInputProps, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { InkPass, noInkFallback, NOINK } from "./ink";
import { LensBlur } from "./lensblur";
import { GradeEffect, GRADES } from "./grade";
import { Room, BG } from "./room";
import { TOTAL, shotAt, kickAt } from "./story";

export const FAMILY_FRAMES = TOTAL;

const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass, setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};
const fwd = new THREE.Vector3(), fpt = new THREE.Vector3(), up = new THREE.Vector3();

const Inner: React.FC = () => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const room = useMemo(() => new Room(), []);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, cam),
    lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }),
    bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADES.day, 1),
  }), [cam, scene]);
  const on = useMemo(() => ({ ink: true, ...((getInputProps() as { post?: { ink?: boolean } }).post ?? {}) }), []);
  const post = useMemo(() => (
    <EffectComposer multisampling={4}>
      {on.ink ? <primitive object={fx.ink} dispose={null} /> : <></>}
      <primitive object={fx.lens.pre} dispose={null} />
      <primitive object={fx.lens.main} dispose={null} />
      <primitive object={fx.bloom} dispose={null} />
      <primitive object={fx.tone} dispose={null} />
      <primitive object={fx.grade} dispose={null} />
    </EffectComposer>
  ), [fx, on]);
  scene.background = BG;
  cam.layers.enable(NOINK);
  const shot = shotAt(f), c = shot.cam(f);
  cam.fov = c.fov; cam.near = 0.1; cam.far = 60;
  cam.position.set(...c.pos);
  cam.up.set(0, 1, 0);
  cam.lookAt(...c.look);
  const kick = kickAt(f);
  cam.rotateZ(((c.roll * Math.PI) / 180) + kick);
  cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  void up;
  room.update(f, cam);
  noInkFallback(room.root);
  const d = shot.dof(f);
  cam.getWorldDirection(fwd);
  fpt.set(...(d.focus ?? c.look));
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd));
  fx.lens.cInf = d.cInf;
  return (<><primitive object={room.root} dispose={null} />{post}</>);
};

const dprOverride = () => (getInputProps() as { post?: { dpr?: number } }).post?.dpr;
export const FamilyShort: React.FC = () => (
  <AbsoluteFill style={{ background: "#efe9e2" }}>
    <ThreeCanvas width={1080} height={1920} {...(dprOverride() ? { dpr: dprOverride() } : {})} shadows
      gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
      camera={{ fov: 50, near: 0.1, far: 60 }}>
      <Inner />
    </ThreeCanvas>
  </AbsoluteFill>
);
