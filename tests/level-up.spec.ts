import { test, expect } from '@playwright/test';
import { buildState } from './fixtures/state';
import { gotoApp, readPersistedState } from './fixtures/inject';
import { TITLES } from '../src/data/canonicalData';

test('player levels up when xp overflows threshold', async ({ page }) => {
  const state = buildState({
    xp: 95,
    xpToNext: 100,
    level: 0,
    title: TITLES[0],
    quests: [
      {
        id: 'lvlup-q1',
        label: 'Level Up Trigger',
        category: 'mind',
        skill: 'Meditation',
        xpReward: 30,
        completedToday: false,
      },
    ],
  });

  await gotoApp(page, state);

  await page.click('[data-testid="quest-complete-lvlup-q1"]');

  await expect.poll(async () => {
    const s = await readPersistedState(page);
    return s.level;
  }).toBe(1);

  const persisted = await readPersistedState(page);
  expect(persisted.level).toBe(1);
  expect(persisted.xp).toBe(25);
  expect(persisted.title).toBe(TITLES[1]);
});
