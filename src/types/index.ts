export type QuestCategory = 'ritual' | 'body' | 'work' | 'skill' | 'mind' | 'recovery';

export type LogType = 'quest_complete' | 'quest_uncomplete' | 'level_up' | 'skill_level_up' | 'streak' | 'ritual_logged' | 'day_start';

export interface LogEntry {
  id: string;
  ts: number;
  type: LogType;
  title: string;
  detail?: string;
  xp?: number;
  level?: number;
}

export type RitualQuestStatus = 'done' | 'honest' | 'skipped';

export interface RitualEntry {
  questId: string;
  status: RitualQuestStatus;
}

export interface Ritual {
  id: string;
  date: string;
  quests: RitualEntry[];
  journal: { mattered: string; obstacle: string; tomorrow: string };
  mood: number | null;
  energy: number | null;
}

export interface Stats {
  str: number;
  int: number;
  per: number;
  hp: number;
  mp: number;
}

export interface Quest {
  id: string;
  label: string;
  category: QuestCategory;
  skill: string;
  xpReward: number;
  earnedXp?: number;
  completedToday: boolean;
  stat: 'str' | 'int' | 'per' | null;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
}

export interface NewQuestInput {
  label: string;
  skill: string;
  xpReward: number;
  stat?: 'str' | 'int' | 'per' | null;
}

export interface QuestTemplate {
  label: string;
  category: QuestCategory;
  skill: string;
  xpReward: number;
}

export interface XpFloat {
  id: number;
  amount: number;
  x: number;
  y: number;
}

// Persisted data only
export interface AppData {
  playerName: string;
  setupComplete: boolean;
  level: number;
  xp: number;
  xpToNext: number;
  title: string;
  lastResetDate: string;
  streak: number;
  quests: Quest[];
  skills: Skill[];
  logs: LogEntry[];
  rituals: Ritual[];
}

// ── Derived selectors ──────────────────────────────────────────
export const computeMaxSkills = (level: number): number => 3 + Math.floor(level / 3);

export const selectXpEarnedToday = (quests: Quest[]) =>
  quests.filter(q => q.completedToday).reduce((sum, q) => sum + q.xpReward, 0);

export const STAT_INFO: Record<keyof Stats, { label: string; name: string; effect: string; color: string }> = {
  str: { label: 'STR', name: 'Strength',   effect: 'Body quests this week',       color: '#e8623a' },
  int: { label: 'INT', name: 'Intellect',  effect: 'Skill/work/mind this week',   color: '#3b8fe8' },
  per: { label: 'PER', name: 'Discipline', effect: 'Ritual quests this week',     color: '#9b5de5' },
  hp:  { label: 'HP',  name: 'Mood',       effect: '7-day mood average',          color: '#00d4ff' },
  mp:  { label: 'MP',  name: 'Energy',     effect: '7-day energy average',        color: '#7c3aed' },
};
