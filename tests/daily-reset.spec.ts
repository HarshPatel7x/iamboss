import { test, expect } from '@playwright/test';
import { buildState } from './fixtures/state';
import { gotoApp, readPersistedState } from './fixtures/inject';

test.skip('daily reset wipes completions, bumps streak, updates lastResetDate', async ({ page }) => {
  const base = buildState();
  const state = {
    ...base,
    lastResetDate: '2020-01-01',
    streak: 4,
    quests: base.quests.map((q, i) =>
      i === 0 ? { ...q, completedToday: true } : q,
    ),
  };

  await gotoApp(page, state);

  const today = new Date().toISOString().slice(0, 10);

  await expect.poll(async () => {
    const s = await readPersistedState(page);
    return s.lastResetDate;
  }).toBe(today);

  const persisted = await readPersistedState(page);
  expect(persisted.streak).toBe(5);
  expect(persisted.lastResetDate).toBe(today);
  expect(persisted.quests.every(q => q.completedToday === false)).toBe(true);
});
