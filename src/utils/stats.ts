import type { Ritual, Quest } from '../types';

const TARGETS: Record<string, number> = { str: 7, int: 10, per: 7 };

export interface ComputedStats {
  str: number; int: number; per: number; hp: number; mp: number;
  raw: { str: number; int: number; per: number };
  hasData: { str: boolean; int: boolean; per: boolean; hp: boolean; mp: boolean };
}

export function computeStats(rituals: Ritual[], quests: Quest[], today: string): ComputedStats {
  const [y, m, d] = today.split('-').map(Number);
  const todayDate = new Date(y, m - 1, d);

  const windowRituals = rituals.filter(r => {
    const [ry, rm, rd] = r.date.split('-').map(Number);
    const rDate = new Date(ry, rm - 1, rd);
    const diff = (todayDate.getTime() - rDate.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff < 7;
  });

  const questMap = new Map(quests.map(q => [q.id, q]));

  const raw = { str: 0, int: 0, per: 0 };
  for (const ritual of windowRituals) {
    for (const entry of ritual.quests) {
      if (entry.status !== 'done') continue;
      const quest = questMap.get(entry.questId);
      if (!quest || !quest.stat) continue;
      if (quest.stat in raw) {
        raw[quest.stat as keyof typeof raw]++;
      }
    }
  }

  const score = (stat: keyof typeof raw) =>
    Math.min(100, Math.round((raw[stat] / TARGETS[stat]) * 100));

  let moodSum = 0, moodCount = 0;
  let energySum = 0, energyCount = 0;
  for (const r of windowRituals) {
    if (r.mood !== null) { moodSum += r.mood; moodCount++; }
    if (r.energy !== null) { energySum += r.energy; energyCount++; }
  }

  return {
    str: score('str'),
    int: score('int'),
    per: score('per'),
    hp: moodCount > 0 ? Math.round(moodSum / moodCount) : 0,
    mp: energyCount > 0 ? Math.round(energySum / energyCount) : 0,
    raw,
    hasData: {
      str: raw.str > 0,
      int: raw.int > 0,
      per: raw.per > 0,
      hp: moodCount > 0,
      mp: energyCount > 0,
    },
  };
}
