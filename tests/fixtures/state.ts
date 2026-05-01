import type { AppData } from '../../src/types/index';
import { canonicalQuests, canonicalSkills, TITLES } from '../../src/data/canonicalData';

export function buildState(overrides: Partial<AppData> = {}): AppData {
  const base: AppData = {
    playerName: 'Player One',
    setupComplete: true,
    level: 0,
    xp: 0,
    xpToNext: 100,
    title: TITLES[0],
    lastResetDate: new Date().toISOString().slice(0, 10),
    streak: 0,
    quests: canonicalQuests.map(q => ({ ...q, completedToday: false })),
    skills: canonicalSkills.map(s => ({ ...s })),
    logs: [],
    rituals: [],
  };
  return { ...base, ...overrides };
}
