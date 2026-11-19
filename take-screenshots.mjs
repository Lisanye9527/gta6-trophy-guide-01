// take-screenshots.mjs — renders the guide in headless Chromium and saves the
// four entry screenshots into screenshots/. The screenshots are real renders
// of the app's own code: the script only seeds a plausible in-progress
// checklist in localStorage, clicks the app's own controls, and photographs
// the viewport at 1280x800, exactly as a player would see it.
//
// Run: node take-screenshots.mjs   (needs the dev server: node serve.ts)
// Playwright is resolved from the scratch install named by SHOTENV.

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(join(process.env.SHOTENV ?? '/tmp/shotenv', 'package.json'));
const { chromium } = require('playwright');

const here = dirname(fileURLToPath(import.meta.url));
const shotsDir = join(here, 'screenshots');
const BASE = 'http://localhost:8080';
const JPEG = { type: 'jpeg', quality: 74 };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

// A player part-way through the story: five trophies ticked, spoiler shield
// on — so the cover also shows a masked "Hidden story trophy" card.
await page.addInitScript(() => {
  localStorage.setItem('gta6-trophy-checklist', JSON.stringify([
    'Just Like Paradise', 'Baited My Tackle',
    'Stick Fiddler', 'Master of None', 'Whip It Good',
  ]));
  localStorage.setItem('gta6-trophy-guide-settings', JSON.stringify({ spoiler: true }));
});

async function settle() {
  await page.waitForSelector('.trophy-card');
  await page.waitForTimeout(250);
}

// 1 — the cover: masthead, progress, filters and the top of the checklist,
//     with the spoiler shield masking the hidden story trophies.
await page.goto(BASE, { waitUntil: 'networkidle' });
await settle();
await page.screenshot({ path: join(shotsDir, '1-checklist.jpg'), ...JPEG });
console.log('shot 1: checklist');

// 2 — one trophy's guide open, with its missable warning and cited sources.
//     The search text is Positive Mental Attitude's own description, which
//     matches that trophy alone; scroll its card to the top so the whole
//     guide fits the frame.
await page.fill('#search', 'Meditate at every spot');
await settle();
await page.click('.trophy-card .guide-toggle');
await page.waitForTimeout(250);
await page.locator('.trophy-card').first().scrollIntoViewIfNeeded();
await page.waitForTimeout(200);
await page.screenshot({ path: join(shotsDir, '2-guide.jpg'), ...JPEG });
console.log('shot 2: guide open');

// 3 — the roadmap to the platinum.
await page.goto(BASE, { waitUntil: 'networkidle' });
await settle();
await page.click('#tab-roadmap');
await page.waitForTimeout(250);
await page.screenshot({ path: join(shotsDir, '3-roadmap.jpg'), ...JPEG });
console.log('shot 3: roadmap');

// 4 — the Missable filter at work: both flagged trophies, one guide open.
await page.click('#tab-checklist');
await page.waitForTimeout(150);
await page.click('.chip[data-kind="missable"]');
await settle();
await page.click('.trophy-card .guide-toggle');
await page.waitForTimeout(250);
await page.screenshot({ path: join(shotsDir, '4-missable.jpg'), ...JPEG });
console.log('shot 4: missable filter');

await browser.close();
console.log('done');
