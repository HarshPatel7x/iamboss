import { test, expect } from '@playwright/test';
import { buildState } from './fixtures/state';
import { gotoApp, readPersistedState } from './fixtures/inject';

test('add a quest, delete it, add a skill, reject duplicate skill', async ({ page }) => {
  const state = buildState({ skills: [] });
  await gotoApp(page, state);

  const originalQuestCount = state.quests.length;

  await page.getByRole('button', { name: '+ Skill' }).click();
  await page.locator('.skill-select').selectOption('Meditation');
  await page.getByRole('button', { name: 'Confirm' }).click();

  await expect.poll(async () => {
    const s = await readPersistedState(page);
    return s.skills.length;
  }).toBe(1);

  await page.getByRole('button', { name: '+ Quest' }).click();
  await page.getByPlaceholder('Quest name...').fill('Test Quest');
  await page.locator('.quest-select--skill').selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Add', exact: true }).click();

  await expect.poll(async () => {
    const s = await readPersistedState(page);
    return s.quests.length;
  }).toBe(originalQuestCount + 1);

  const afterAdd = await readPersistedState(page);
  const added = afterAdd.quests.find(q => q.label === 'Test Quest')!;
  expect(added).toBeDefined();

  await page.locator(`[data-testid="quest-row-${added.id}"] .quest-delete`).click();

  await expect.poll(async () => {
    const s = await readPersistedState(page);
    return s.quests.length;
  }).toBe(originalQuestCount);

  // Verify duplicate skill not available in dropdown
  await page.getByRole('button', { name: '+ Skill' }).click();
  const options = await page.locator('.skill-select option').allTextContents();
  expect(options).not.toContain('Meditation');

  const finalState = await readPersistedState(page);
  expect(finalState.skills.length).toBe(1);
});
