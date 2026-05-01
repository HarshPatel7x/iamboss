import { test } from '@playwright/test';
import { buildState } from './fixtures/state';
import { gotoApp } from './fixtures/inject';

test.skip('stats are now computed from rituals, not from quest completion', async ({ page }) => {
  const state = buildState();
  await gotoApp(page, state);
  // Stats are now derived from rituals via computeStats — no direct stat mutation on quest complete
});
