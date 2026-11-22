// usage: node stills.mjs <engineDir> <compId> <outDir> <scale> <frame,frame,...>
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs"; import path from "node:path";
const [eng, id, out, scale, list] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(eng, "src/index.ts"), webpackOverride: (c) => c });
const pwDirs = fs.existsSync("/opt/pw-browsers") ? fs.readdirSync("/opt/pw-browsers").filter((d) => d.startsWith("chromium_headless_shell") && fs.statSync(`/opt/pw-browsers/${d}`).isDirectory()) : [];
const pw = pwDirs.length ? pwDirs.map((d) => { const b = `/opt/pw-browsers/${d}`; const s = fs.readdirSync(b).find((x) => x.startsWith("chrome-headless-shell")); return `${b}/${s}/chrome-headless-shell`; })[0] : undefined; // undefined = Remotion's own browser
const gl = fs.readFileSync(path.join(eng, "../.gl-flag"), "utf8").trim();
const composition = await selectComposition({ serveUrl, id, browserExecutable: pw, chromiumOptions: { gl } });
for (const fr of list.split(",").map(Number)) {
  await renderStill({ serveUrl, composition, frame: fr, output: path.join(out, `f${String(fr).padStart(4, "0")}.png`), scale: Number(scale), browserExecutable: pw, chromiumOptions: { gl } });
  console.log("still", fr);
}
