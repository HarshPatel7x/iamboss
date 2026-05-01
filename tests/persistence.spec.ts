import { test, expect } from '@playwright/test';
import { buildState } from './fixtures/state';
import { gotoApp, readPersistedState } from './fixtures/inject';

test('completed quest and xp survive a page reload', async ({ page }) => {
  const state = buildState();
  const target = state.quests[0];

  await gotoApp(page, state);

  await page.click(`[data-testid="quest-complete-${target.id}"]`);

  await expect.poll(async () => {
    const s = await readPersistedState(page);
    return s.quests.find(q => q.id === target.id)?.completedToday;
  }).toBe(true);

  await page.reload();
  await page.waitForSelector('[data-testid="player-level"]', { timeout: 10000 });

  const persisted = await readPersistedState(page);
  const quest = persisted.quests.find(q => q.id === target.id)!;
  expect(quest.completedToday).toBe(true);
  expect(persisted.xp).toBe(target.xpReward);
});
