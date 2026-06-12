import { chromium } from 'playwright';

// usage: node scripts/screenshot.mjs <url> <out> [width] [height] [touch]
const url = process.argv[2] || 'http://localhost:5173/?d3';
const out = process.argv[3] || '/tmp/hero.png';
const width = Number(process.argv[4] || 1440);
const height = Number(process.argv[5] || 900);
const touch = process.argv[6] === 'touch';

const browser = await chromium.launch({ headless: false, args: ['--no-sandbox'] });
const ctx = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: 2,
  colorScheme: 'dark',
  isMobile: touch,
  hasTouch: touch,
});
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
if (!touch) await page.mouse.move(width * 0.75, height * 0.45);
await page.waitForTimeout(4500);
await page.screenshot({ path: out });
console.log('SAVED', out, 'ERRORS', JSON.stringify(errors.slice(0, 8)));
await browser.close();
