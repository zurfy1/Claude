// node tools/render.cjs <out.mp4> <startFrame> <endFrame(excl)> [scale=1]
// Renders frames from the page and pipes JPEGs into ffmpeg (24 fps, H.264).
const { chromium } = require('playwright');
const { spawn } = require('child_process');
(async () => {
  const [out, f0s, f1s, scaleS = '1'] = process.argv.slice(2);
  const f0 = Number(f0s), f1 = Number(f1s), scale = Number(scaleS), FPS = 24;
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: scale });
  p.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await p.goto('http://localhost:8765/index.html');
  await p.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', scale < 1 ? '23' : '16', '-pix_fmt', 'yuv420p', '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    await p.evaluate((t) => window.renderAt(t), f / FPS);
    const buf = await p.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if ((f - f0) % 48 === 0) console.log(`${out}: frame ${f - f0 + 1}/${f1 - f0} ${((Date.now() - t0) / (f - f0 + 1)).toFixed(0)} ms/frame`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  await b.close();
  console.log('done', out, ((Date.now() - t0) / 1000).toFixed(0), 's');
})();
