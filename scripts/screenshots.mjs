/**
 * Capture portfolio screenshots into docs/screenshots/.
 *
 * Usage:
 *   1. Start dev server: npm run dev
 *   2. In another terminal: node scripts/screenshots.mjs
 *
 * Seeds synthetic non-personal data via localStorage, captures HUD,
 * Evening Ritual, Data Panel, and a mobile viewport shot.
 */

import { chromium, devices } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'docs', 'screenshots');
const URL = process.env.IAMBOSS_URL ?? 'http://localhost:5173';

const seed = {
  state: {
    playerName: 'Player One',
    setupComplete: true,
    level: 4,
    xp: 120,
    xpToNext: 350,
    title: 'The Adept',
    streak: 12,
    lastResetDate: new Date().toISOString().split('T')[0],
    quests: [
      { id: 'q_consistency', label: 'Consistency', skill: 'Consistency', category: 'ritual', xpReward: 10, completedToday: true, stat: 'per' },
      { id: 'q_wake', label: 'Wake up – No Phone', skill: 'Consistency', category: 'ritual', xpReward: 35, completedToday: true, stat: 'per' },
      { id: 'q_meditation', label: 'Meditation', skill: 'Consistency', category: 'ritual', xpReward: 20, completedToday: true, stat: 'per' },
      { id: 'q_workout', label: 'Workout', skill: 'Strength Training', category: 'body', xpReward: 35, completedToday: false, stat: 'str' },
      { id: 'q_deepwork', label: 'Deep Work Block', skill: 'Backend Engineering', category: 'work', xpReward: 50, completedToday: false, stat: 'int' },
      { id: 'q_winddown', label: 'Wind down', skill: 'Consistency', category: 'ritual', xpReward: 10, completedToday: false, stat: 'per' },
      { id: 'q_sleep', label: 'Sleep', skill: 'Sleep Mastery', category: 'recovery', xpReward: 35, completedToday: false, stat: null },
    ],
    skills: [
      { id: 's1', name: 'Strength Training', level: 2, xp: 20, xpToNext: 50 },
      { id: 's2', name: 'Consistency', level: 5, xp: 15, xpToNext: 50 },
      { id: 's3', name: 'Sleep Mastery', level: 3, xp: 35, xpToNext: 50 },
      { id: 's4', name: 'Backend Engineering', level: 1, xp: 10, xpToNext: 50 },
    ],
    logs: [
      { type: 'quest_complete', title: 'Meditation', detail: 'Consistency', xp: 20, id: 'l1', ts: Date.now() - 1000 * 60 * 5 },
      { type: 'quest_complete', title: 'Wake up – No Phone', detail: 'Consistency', xp: 35, id: 'l2', ts: Date.now() - 1000 * 60 * 90 },
      { type: 'quest_complete', title: 'Consistency', detail: 'Consistency', xp: 10, id: 'l3', ts: Date.now() - 1000 * 60 * 120 },
      { type: 'streak', title: 'Streak x12 maintained', id: 'l4', ts: Date.now() - 1000 * 60 * 60 * 12 },
      { type: 'day_start', title: 'New day — Streak 12', id: 'l5', ts: Date.now() - 1000 * 60 * 60 * 14 },
    ],
    rituals: [
      ...Array.from({ length: 6 }).map((_, i) => ({
        id: `r_demo_${i}`,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * (i + 1)).toISOString().split('T')[0],
        quests: [
          { questId: 'q_consistency', status: 'done' },
          { questId: 'q_wake', status: i % 2 ? 'done' : 'honest' },
          { questId: 'q_meditation', status: 'done' },
          { questId: 'q_workout', status: i === 2 ? 'skipped' : 'done' },
          { questId: 'q_winddown', status: 'done' },
          { questId: 'q_sleep', status: 'done' },
        ],
        journal: { mattered: '', obstacle: '', tomorrow: '' },
        mood: 70 + (i % 3) * 10,
        energy: 65 + (i % 4) * 8,
      })),
    ],
  },
  version: 13,
};

async function ensureOut() {
  await mkdir(OUT, { recursive: true });
}

async function seedAndOpen(page) {
  await page.goto(URL);
  await page.evaluate((data) => {
    localStorage.setItem('iamboss_state', JSON.stringify(data));
  }, seed);
  await page.goto(URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

async function main() {
  await ensureOut();
  const browser = await chromium.launch();

  // 01 — Main HUD
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await seedAndOpen(page);
    await page.screenshot({ path: `${OUT}/01-hud.png`, fullPage: false });
    console.log('✓ 01-hud.png');
    await ctx.close();
  }

  // 02 — Quests close-up
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await seedAndOpen(page);
    await page.screenshot({
      path: `${OUT}/02-quests.png`,
      clip: { x: 0, y: 200, width: 1100, height: 700 },
    });
    console.log('✓ 02-quests.png');
    await ctx.close();
  }

  // 03 — Evening Ritual modal
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await seedAndOpen(page);
    const ritualBtn = page.getByRole('button', { name: /Log Ritual|Evening Ritual|Ritual/i }).first();
    if (await ritualBtn.count()) {
      await ritualBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${OUT}/03-ritual.png`, fullPage: false });
      console.log('✓ 03-ritual.png');
    } else {
      console.log('⚠ ritual button not found, skipping 03');
    }
    await ctx.close();
  }

  // 04 — Data Panel
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await seedAndOpen(page);
    const gearBtn = page.getByRole('button', { name: /settings|data|⚙/i }).first();
    if (await gearBtn.count()) {
      await gearBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${OUT}/04-data-panel.png`, fullPage: false });
      console.log('✓ 04-data-panel.png');
    } else {
      console.log('⚠ gear button not found, skipping 04');
    }
    await ctx.close();
  }

  // 05 — Mobile
  {
    const ctx = await browser.newContext({ ...devices['iPhone 14 Pro'], deviceScaleFactor: 3 });
    const page = await ctx.newPage();
    await seedAndOpen(page);
    await page.screenshot({ path: `${OUT}/05-mobile.png`, fullPage: false });
    console.log('✓ 05-mobile.png');
    await ctx.close();
  }

  await browser.close();
  console.log(`\nAll screenshots written to ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
