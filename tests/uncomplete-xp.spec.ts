import { test, expect } from '@playwright/test';
import { buildState } from './fixtures/state';
import { gotoApp, readPersistedState } from './fixtures/inject';

test('uncompleting a quest deducts the earned XP', async ({ page }) => {
  const base = buildState();
  const bodyQuest = base.quests.find(q => q.category === 'body')!;

  // No multiplier in Phase 1 — earned = xpReward = 30
  const state = buildState();

  await gotoApp(page, state);

  // Complete the body quest
  await page.click(`[data-testid="quest-complete-${bodyQuest.id}"]`);

  // Wait for XP to be awarded
  await expect.poll(async () => {
    const s = await readPersistedState(page);
    return s.xp;
  }).toBeGreaterThan(0);

  const afterComplete = await readPersistedState(page);
  expect(afterComplete.xp).toBe(30);

  // Uncomplete the quest
  await page.click(`[data-testid="quest-complete-${bodyQuest.id}"]`);

  // Wait for XP to return to 0
  await expect.poll(async () => {
    const s = await readPersistedState(page);
    return s.xp;
  }).toBe(0);

  const afterUncomplete = await readPersistedState(page);
  expect(afterUncomplete.xp).toBe(0);
});
