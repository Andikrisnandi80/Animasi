import React from "react";
import { Composition } from "remotion";
import { FamilyShort, FAMILY_FRAMES } from "./videos/family/Family";

export const RemotionRoot: React.FC = () => (
  <Composition id="FamilyShort" component={FamilyShort} durationInFrames={FAMILY_FRAMES} fps={30} width={1080} height={1920} />
);
