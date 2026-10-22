// Ekran görüntüsü modunu açıp her sayfanın görüntüsünü docs/screenshots/ altına kaydeder.
import { chromium } from 'playwright';
import { createServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(dir, '../docs/screenshots');
const server = await createServer({ configFile: path.join(dir, 'vite.config.ts') });
await server.listen();
const base = `http://localhost:${server.config.server.port}`;

const shots = [
  ['login', '?user=0'],
  ['home', '?view=home'],
  ['rules', '?view=rules'],
  ['character', '?view=character-creation'],
  ['dashboard', '?view=tournament-dashboard'],
  ['profile', '?view=profile'],
];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
for (const mobile of [false, true]) {
  const page = await browser.newPage(mobile
    ? { viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 }
    : { viewport: { width: 1440, height: 900 } });
  for (const [name, qs] of shots) {
    await page.goto(base + '/screenshots/index.html' + qs, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500); // animasyonlar
    await page.screenshot({ path: path.join(out, `${name}${mobile ? '-mobile' : ''}.png`) });
    console.log('✓', name, mobile ? '(mobil)' : '');
  }
  if (!mobile) {
    // Puan durumu ve tur eşleşmeleri kesiti
    await page.goto(base + '/screenshots/index.html?view=tournament-dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await page.getByText('Turnuva Şeması').first().scrollIntoViewIfNeeded();
    await page.setViewportSize({ width: 1440, height: 1500 });
    await page.getByText('Turnuva Şeması').first().evaluate(el => el.scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(out, 'bracket.png') });
    console.log('✓ bracket');
  }
  await page.close();
}
await browser.close();
await server.close();
