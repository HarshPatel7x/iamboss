import { test, expect } from '@playwright/test';
import { buildState } from './fixtures/state';
import { gotoApp, readPersistedState } from './fixtures/inject';

test('completing a quest awards player xp and skill xp', async ({ page }) => {
  const state = buildState();
  const target = state.quests[0]; // q1 Wake Up — No Phone · ritual · Meditation · xp 10

  await gotoApp(page, state);

  await page.click(`[data-testid="quest-complete-${target.id}"]`);

  await expect.poll(async () => {
    const s = await readPersistedState(page);
    return s.xp;
  }).toBe(target.xpReward);

  const persisted = await readPersistedState(page);
  const completedQuest = persisted.quests.find(q => q.id === target.id)!;
  expect(completedQuest.completedToday).toBe(true);
  expect(persisted.xp).toBe(target.xpReward);

  const meditation = persisted.skills.find(s => s.name === target.skill)!;
  expect(meditation.xp).toBeGreaterThan(0);
});
