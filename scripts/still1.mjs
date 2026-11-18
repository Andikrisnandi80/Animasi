import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [out, frame, props] = process.argv.slice(2);
const browserExecutable = "/opt/pw-browsers/chromium", chromiumOptions = { gl: "swangle" };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const inputProps = props ? JSON.parse(props) : {};
const composition = await selectComposition({ serveUrl, id: "FamilyShort", browserExecutable, chromiumOptions, inputProps });
await renderStill({ composition, serveUrl, frame: Number(frame), output: out, imageFormat: "jpeg", scale: 0.5, browserExecutable, chromiumOptions, inputProps, timeoutInMilliseconds: 240000 });
