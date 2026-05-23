import type { AppData } from '../types';
import { canonicalQuests, canonicalSkills } from '../data/canonicalData';

export const CURRENT_SCHEMA_VERSION = 14;

function categoryToStatMigration(cat: string): 'str' | 'int' | 'per' | null {
  switch (cat) {
    case 'body': return 'str';
    case 'skill': case 'work': case 'mind': return 'int';
    case 'ritual': return 'per';
    default: return null;
  }
}

export function migrateAppData(raw: unknown, fromVersion: number): AppData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let s: any = raw ?? {};

  if (fromVersion < 7) {
    s = { ...s, logs: s.logs ?? [] };
  }

  if (fromVersion < 10) {
    // Add stat field to quests, strip deleted fields
    if (Array.isArray(s.quests)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      s.quests = s.quests.map((q: any) => {
        const stat = q.stat !== undefined ? q.stat : categoryToStatMigration(q.category ?? '');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { time: _t, penaltyApplied: _p, repeatDays: _r, scheduledDate: _sd, ...rest } = q;
        return { ...rest, stat };
      });
    }
    // Strip deleted AppData-level fields
    delete s.ap;
    delete s.fatigue;
    delete s.currentHp;
    delete s.currentMp;
    delete s.categoryCompletions;
  }

  if (fromVersion < 11) {
    if (!Array.isArray(s.rituals)) {
      s.rituals = [];
    }
  }

  if (fromVersion < 12) {
    // Stats are now derived live from rituals (see utils/stats.ts).
    // Drop the persisted `stats` field so exports stop showing stale values.
    delete s.stats;
  }

  if (fromVersion < 13) {
    // Penalties feature was nuked. Strip stale penalty log entries from before the nuke.
    if (Array.isArray(s.logs)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      s.logs = s.logs.filter((l: any) => l?.type !== 'penalty');
    }
  }

  if (fromVersion < 14) {
    // v14: optional per-quest input field (Quest.field) + RitualEntry.fieldValue.
    // Strictly additive — both are optional, absent on all v13-and-earlier data.
    // No-op: existing quests/rituals pass through unchanged.
  }

  return {
    playerName: s.playerName ?? '',
    setupComplete: s.setupComplete ?? false,
    level: s.level ?? 0,
    xp: s.xp ?? 0,
    xpToNext: s.xpToNext ?? 100,
    title: s.title ?? 'The Awakened',
    lastResetDate: s.lastResetDate ?? new Date().toISOString().split('T')[0],
    streak: s.streak ?? 0,
    quests: s.quests ?? canonicalQuests,
    skills: s.skills ?? canonicalSkills,
    logs: s.logs ?? [],
    rituals: s.rituals ?? [],
  };
}
