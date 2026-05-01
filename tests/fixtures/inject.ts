import type { Page } from '@playwright/test';
import type { AppData } from '../../src/types/index';
import { CURRENT_SCHEMA_VERSION } from '../../src/store/migrations';

export async function gotoApp(page: Page, state: AppData): Promise<void> {
  await page.context().addInitScript((s) => {
    if (!localStorage.getItem('iamboss_state')) {
      localStorage.setItem('iamboss_state', JSON.stringify({ state: s.data, version: s.version }));
    }
  }, { data: state, version: CURRENT_SCHEMA_VERSION });
  await page.goto('/');
  await page.waitForSelector('[data-testid="player-level"]', { timeout: 10000 });
  await page.waitForSelector('.quest-log', { timeout: 5000 });
}

export async function readPersistedState(page: Page): Promise<AppData> {
  const raw = await page.evaluate(() => localStorage.getItem('iamboss_state'));
  if (!raw) throw new Error('No persisted state found');
  return JSON.parse(raw).state as AppData;
}
