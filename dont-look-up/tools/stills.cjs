// node tools/stills.cjs <outDir> <t1,t2,...> [scale]
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [outDir, ts, scale = '0.5'] = process.argv.slice(2);
  fs.mkdirSync(outDir, { recursive: true });
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: Number(scale) });
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text()); });
  p.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await p.goto('http://localhost:8765/index.html');
  await p.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
  for (const t of ts.split(',').map(Number)) {
    const t0 = Date.now();
    await p.evaluate((t) => window.renderAt(t), t);
    await p.screenshot({ path: `${outDir}/t${t.toFixed(2).padStart(6, '0')}.png` });
    console.log('t', t, Date.now() - t0, 'ms');
  }
  await b.close();
})();
