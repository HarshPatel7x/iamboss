import { test, expect, type Page } from '@playwright/test';
import { readPersistedState } from './fixtures/inject';

// Mirror the real v13 backup shape (12 AppData keys, no field/fieldValue).
const v13Blob = {
  playerName: 'Tester',
  setupComplete: true,
  level: 1,
  xp: 135,
  xpToNext: 200,
  title: 'The Grinder',
  lastResetDate: new Date().toISOString().slice(0, 10),
  streak: 9,
  quests: [
    { id: 'q1', label: 'Wake Up', category: 'ritual', skill: 'Consistency', xpReward: 10, completedToday: false, stat: 'per' },
    { id: 'q2', label: 'Meditate', category: 'ritual', skill: 'Inner Peace', xpReward: 15, completedToday: false, stat: 'per' },
    { id: 'q3', label: 'Exercise', category: 'body', skill: 'Strength Training', xpReward: 30, completedToday: false, stat: 'str' },
  ],
  skills: [
    { id: 's1', name: 'Strength Training', level: 3, xp: 0, xpToNext: 50 },
    { id: 's2', name: 'Meditation', level: 0, xp: 0, xpToNext: 50 },
    { id: 's3', name: 'Cold Exposure', level: 0, xp: 0, xpToNext: 50 },
  ],
  logs: [
    { id: 'l1', ts: Date.now() - 1000, type: 'ritual_logged', title: 'Evening ritual logged', detail: '3 done' },
    { id: 'l2', ts: Date.now() - 2000, type: 'day_start', title: 'New day — Streak 9' },
  ],
  rituals: [
    {
      id: 'r1',
      date: '2026-05-19',
      quests: [
        { questId: 'q1', status: 'done' },
        { questId: 'q2', status: 'honest' },
      ],
      journal: { mattered: 'Showed up.', obstacle: 'Slow start.', tomorrow: 'Earlier wake.' },
      mood: 70,
      energy: 60,
    },
  ],
};

async function loadAppWithRawPersist(page: Page, raw: object) {
  await page.context().addInitScript((blob) => {
    localStorage.setItem('iamboss_state', JSON.stringify(blob));
  }, raw);
  await page.goto('/');
  await page.waitForSelector('[data-testid="player-level"]', { timeout: 10000 });
}

test('v13 persisted blob migrates to v14 with all 12 fields preserved', async ({ page }) => {
  await loadAppWithRawPersist(page, { state: v13Blob, version: 13 });

  // Wait for the persist layer to re-stamp the version after migration.
  await expect.poll(async () => {
    const raw = await page.evaluate(() => localStorage.getItem('iamboss_state'));
    return raw ? JSON.parse(raw).version : null;
  }).toBe(14);

  const persisted = await readPersistedState(page);

  expect(persisted.playerName).toBe(v13Blob.playerName);
  expect(persisted.setupComplete).toBe(v13Blob.setupComplete);
  expect(persisted.level).toBe(v13Blob.level);
  expect(persisted.xp).toBe(v13Blob.xp);
  expect(persisted.xpToNext).toBe(v13Blob.xpToNext);
  expect(persisted.title).toBe(v13Blob.title);
  expect(persisted.lastResetDate).toBe(v13Blob.lastResetDate);
  expect(persisted.streak).toBe(v13Blob.streak);
  expect(persisted.quests).toHaveLength(v13Blob.quests.length);
  expect(persisted.skills).toHaveLength(v13Blob.skills.length);
  expect(persisted.logs).toHaveLength(v13Blob.logs.length);
  expect(persisted.rituals).toHaveLength(v13Blob.rituals.length);
  expect(persisted.skills[0].name).toBe('Strength Training');
  expect(persisted.skills[0].level).toBe(3);
});

test('v14 blob with Quest.field and RitualEntry.fieldValue round-trips unchanged', async ({ page }) => {
  const v14Blob = {
    ...v13Blob,
    quests: [
      ...v13Blob.quests,
      {
        id: 'q4',
        label: 'Cold Shower',
        category: 'ritual',
        skill: 'Cold Exposure',
        xpReward: 10,
        completedToday: false,
        stat: 'per',
        field: { type: 'duration', label: 'seconds' },
      },
    ],
    rituals: [
      {
        ...v13Blob.rituals[0],
        quests: [
          { questId: 'q1', status: 'done' },
          { questId: 'q4', status: 'done', fieldValue: '120' },
        ],
      },
    ],
  };

  await loadAppWithRawPersist(page, { state: v14Blob, version: 14 });

  await expect.poll(async () => {
    const raw = await page.evaluate(() => localStorage.getItem('iamboss_state'));
    return raw ? JSON.parse(raw).version : null;
  }).toBe(14);

  const persisted = await readPersistedState(page);

  const q4 = persisted.quests.find(q => q.id === 'q4');
  expect(q4?.field).toEqual({ type: 'duration', label: 'seconds' });

  const ritualEntry = persisted.rituals[0].quests.find(q => q.questId === 'q4');
  expect(ritualEntry?.fieldValue).toBe('120');
});
