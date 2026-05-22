import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { canonicalQuests, canonicalSkills, TITLES, SKILL_XP_PER_LEVEL, SKILL_CATEGORY, categoryToStat } from '../data/canonicalData';
import type { AppData, Quest, Skill, NewQuestInput, XpFloat, LogEntry, RitualEntry, Ritual } from '../types';
import { computeMaxSkills } from '../types';
import { migrateAppData, CURRENT_SCHEMA_VERSION } from './migrations';

function todayString() {
  return new Date().toISOString().split('T')[0];
}

function playerXpToNext(level: number) {
  return (level + 1) * 100;
}

interface GameStore extends AppData {
  // UI state — not persisted
  showReport: boolean;
  showLevelUp: boolean;
  levelUpNumber: number;
  xpFloats: XpFloat[];
  hoveredQuestId: string | null;
  showEveningRitual: boolean;

  checkDailyReset: () => void;

  completeQuest: (id: string) => void;
  uncompleteQuest: (id: string) => void;
  addQuest: (input: NewQuestInput) => void;
  deleteQuest: (id: string) => void;

  addSkill: (name: string) => boolean;
  deleteSkill: (id: string) => boolean;

  completeSetup: (name: string, skillNames: string[], quests: Quest[]) => void;

  submitRitual: (input: { quests: RitualEntry[]; journal: { mattered: string; obstacle: string; tomorrow: string }; mood: number | null; energy: number | null }) => void;
  openEveningRitual: () => void;
  closeEveningRitual: () => void;

  spawnXpFloat: (amount: number, x: number, y: number) => void;
  dismissXpFloat: (id: number) => void;
  setShowReport: (v: boolean) => void;
  showLevelUpOverlay: (level: number) => void;
  dismissLevelUp: () => void;

  setHoveredQuest: (id: string | null) => void;
  logEvent: (entry: Omit<LogEntry, 'id' | 'ts'>) => void;

  resetToCanonical: () => void;
  applyData: (data: Partial<AppData>) => void;
}

let floatId = 0;

function syncStateToServer(s: GameStore) {
  const backup = {
    playerName: s.playerName, setupComplete: s.setupComplete,
    level: s.level, xp: s.xp, xpToNext: s.xpToNext,
    title: s.title, lastResetDate: s.lastResetDate, streak: s.streak,
    quests: s.quests, skills: s.skills, logs: s.logs, rituals: s.rituals,
  };
  fetch('/api/save-state', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(backup),
  }).catch(() => {});
}

function awardSkillXp(skills: Skill[], skillName: string, amount: number): Skill[] {
  return skills.map(s => {
    if (s.name !== skillName) return s;
    let newXp = s.xp + amount;
    let newLevel = s.level;
    while (newXp >= SKILL_XP_PER_LEVEL) {
      newXp -= SKILL_XP_PER_LEVEL;
      newLevel++;
    }
    return { ...s, xp: newXp, level: newLevel, xpToNext: SKILL_XP_PER_LEVEL };
  });
}

function deductSkillXp(skills: Skill[], skillName: string, amount: number): Skill[] {
  return skills.map(s => {
    if (s.name !== skillName) return s;
    let newXp = s.xp - amount;
    let newLevel = s.level;
    if (newXp < 0 && newLevel > 0) {
      newLevel = Math.max(0, newLevel - 1);
      newXp = Math.max(0, SKILL_XP_PER_LEVEL + newXp);
    } else {
      newXp = Math.max(0, newXp);
    }
    return { ...s, xp: newXp, level: newLevel, xpToNext: SKILL_XP_PER_LEVEL };
  });
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => {
      const initLevel = 0;
      return {
        // — persisted initial data —
        playerName: '',
        setupComplete: false,
        level: initLevel,
        xp: 0,
        xpToNext: playerXpToNext(initLevel),
        title: TITLES[0],
        lastResetDate: todayString(),
        streak: 0,
        quests: canonicalQuests,
        skills: canonicalSkills,
        logs: [],
        rituals: [],

        // — UI state (not persisted) —
        showReport: false,
        showLevelUp: false,
        levelUpNumber: 0,
        xpFloats: [],
        hoveredQuestId: null,
        showEveningRitual: false,

        checkDailyReset: () => {
          const s = get();
          const today = todayString();
          if (s.lastResetDate === today) return;

          // Log-based streak: check if yesterday has a ritual entry
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          const hasYesterdayRitual = s.rituals.some(r => r.date === yesterdayStr);
          const hasTodayRitual = s.rituals.some(r => r.date === today);
          const newStreak = (hasYesterdayRitual || hasTodayRitual) ? s.streak : 0;

          set({
            streak: newStreak,
            lastResetDate: today,
            quests: s.quests.map(q => ({ ...q, completedToday: false, earnedXp: undefined })),
          });
          get().logEvent({ type: 'day_start', title: `New day — Streak ${newStreak}` });
        },

        completeQuest: (id) => {
          const s = get();
          const quest = s.quests.find(q => q.id === id);
          if (!quest || quest.completedToday) return;

          const earned = quest.xpReward;

          let newXp = s.xp + earned;
          let newLevel = s.level;
          let newXpToNext = s.xpToNext;
          let leveledUp = false;

          while (newXp >= newXpToNext) {
            newXp -= newXpToNext;
            newLevel++;
            newXpToNext = playerXpToNext(newLevel);
            leveledUp = true;
          }

          const updatedSkills = awardSkillXp(s.skills, quest.skill, quest.xpReward);

          set({
            xp: newXp, level: newLevel, xpToNext: newXpToNext,
            title: TITLES[newLevel] ?? TITLES[9],
            skills: updatedSkills,
            quests: s.quests.map(q => q.id === id ? { ...q, completedToday: true, earnedXp: earned } : q),
          });

          get().logEvent({ type: 'quest_complete', title: quest.label, detail: quest.skill, xp: earned });
          if (leveledUp) {
            get().logEvent({ type: 'level_up', title: `Reached Level ${newLevel}`, level: newLevel });
          }
          const updatedSkillObj = updatedSkills.find(sk => sk.name === quest.skill);
          const oldSkillObj = s.skills.find(sk => sk.name === quest.skill);
          if (updatedSkillObj && oldSkillObj && updatedSkillObj.level > oldSkillObj.level) {
            get().logEvent({ type: 'skill_level_up', title: `${quest.skill} reached Lv.${updatedSkillObj.level}` });
          }

          if (leveledUp) get().showLevelUpOverlay(newLevel);
        },

        uncompleteQuest: (id) => {
          const s = get();
          const quest = s.quests.find(q => q.id === id);
          if (!quest || !quest.completedToday) return;

          const deduction = quest.earnedXp ?? quest.xpReward;
          let newXp = s.xp - deduction;
          let newLevel = s.level;
          let newXpToNext = s.xpToNext;

          if (newXp < 0) {
            newLevel = Math.max(0, newLevel - 1);
            newXpToNext = playerXpToNext(newLevel);
            newXp = Math.max(0, newXpToNext + newXp);
          }

          set({
            xp: newXp, level: newLevel, xpToNext: newXpToNext,
            title: TITLES[newLevel] ?? TITLES[9],
            skills: deductSkillXp(s.skills, quest.skill, quest.xpReward),
            quests: s.quests.map(q => q.id === id ? { ...q, completedToday: false, earnedXp: undefined } : q),
          });

          get().logEvent({ type: 'quest_uncomplete', title: quest.label, xp: -deduction });
        },

        addQuest: (input) => {
          const category = SKILL_CATEGORY[input.skill] ?? 'work';
          const stat = input.stat !== undefined ? input.stat : categoryToStat(category);
          const newQuest: Quest = {
            id: `q${Date.now()}`, ...input, category, stat, completedToday: false,
          };
          set(s => ({ quests: [...s.quests, newQuest] }));
          syncStateToServer(get());
        },

        deleteQuest: (id) => set(s => ({ quests: s.quests.filter(q => q.id !== id) })),

        addSkill: (name) => {
          const s = get();
          if (s.skills.some(sk => sk.name.trim().toLowerCase() === name.trim().toLowerCase())) return false;
          if (s.skills.length >= computeMaxSkills(s.level)) return false;
          const newSkill: Skill = { id: `s${Date.now()}`, name, level: 0, xp: 0, xpToNext: SKILL_XP_PER_LEVEL };
          set(s => ({ skills: [...s.skills, newSkill] }));
          syncStateToServer(get());
          return true;
        },

        deleteSkill: (id) => {
          const s = get();
          const skill = s.skills.find(sk => sk.id === id);
          if (!skill) return true;
          if (s.quests.some(q => q.skill === skill.name)) return false;
          set(s => ({ skills: s.skills.filter(sk => sk.id !== id) }));
          return true;
        },

        completeSetup: (name, skillNames, quests) => {
          const skills: Skill[] = skillNames.map((skillName, i) => ({
            id: `s${i + 1}`,
            name: skillName,
            level: 0,
            xp: 0,
            xpToNext: SKILL_XP_PER_LEVEL,
          }));
          set({
            playerName: name.trim(),
            setupComplete: true,
            skills,
            quests,
            level: 0, xp: 0, xpToNext: playerXpToNext(0),
            title: TITLES[0], streak: 0,
            lastResetDate: todayString(),
            logs: [],
            rituals: [],
          });
          syncStateToServer(get());
        },

        submitRitual: (input) => {
          const s = get();
          const today = todayString();
          const existing = s.rituals.find(r => r.date === today);
          const oldDoneIds = existing?.quests.filter(q => q.status === 'done').map(q => q.questId) ?? [];
          const newDoneIds = input.quests.filter(q => q.status === 'done').map(q => q.questId);

          const addedDone = newDoneIds.filter(id => !oldDoneIds.includes(id));
          const removedDone = oldDoneIds.filter(id => !newDoneIds.includes(id));

          let xp = s.xp;
          let level = s.level;
          let xpToNext = s.xpToNext;
          let skills = s.skills;
          let leveledUp = false;
          let lastLevel = level;

          // Award XP for newly done quests
          for (const questId of addedDone) {
            const quest = s.quests.find(q => q.id === questId);
            if (!quest) continue;
            xp += quest.xpReward;
            while (xp >= xpToNext) {
              xp -= xpToNext;
              level++;
              xpToNext = playerXpToNext(level);
              leveledUp = true;
              lastLevel = level;
            }
            skills = awardSkillXp(skills, quest.skill, quest.xpReward);
          }

          // Deduct XP for removed done quests
          for (const questId of removedDone) {
            const quest = s.quests.find(q => q.id === questId);
            if (!quest) continue;
            xp -= quest.xpReward;
            if (xp < 0) {
              level = Math.max(0, level - 1);
              xpToNext = playerXpToNext(level);
              xp = Math.max(0, xpToNext + xp);
            }
            skills = deductSkillXp(skills, quest.skill, quest.xpReward);
          }

          const ritual: Ritual = {
            id: existing?.id ?? `r${Date.now()}`,
            date: today,
            quests: input.quests,
            journal: input.journal,
            mood: input.mood,
            energy: input.energy,
          };

          const updatedRituals = existing
            ? s.rituals.map(r => r.date === today ? ritual : r)
            : [...s.rituals, ritual];

          // Streak: submitting today's ritual carries streak forward
          const newStreak = s.streak + (existing ? 0 : 1);

          set({
            xp, level, xpToNext, skills,
            title: TITLES[level] ?? TITLES[9],
            rituals: updatedRituals,
            streak: newStreak,
          });

          get().logEvent({ type: 'ritual_logged', title: 'Evening ritual logged', detail: `${newDoneIds.length} done` });
          if (leveledUp) {
            get().logEvent({ type: 'level_up', title: `Reached Level ${lastLevel}`, level: lastLevel });
            get().showLevelUpOverlay(lastLevel);
          }

          // Silent full-state backup to disk + GitHub
          syncStateToServer(get());

          // Silent sync to companion server — writes /memories/iamboss-ritual-log.md
          fetch('/api/sync-ritual', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rituals: updatedRituals, quests: get().quests }),
          }).catch(() => {});
        },

        openEveningRitual: () => set({ showEveningRitual: true }),
        closeEveningRitual: () => set({ showEveningRitual: false }),

        spawnXpFloat: (amount, x, y) => {
          const id = ++floatId;
          set(s => ({ xpFloats: [...s.xpFloats, { id, amount, x, y }] }));
          setTimeout(() => get().dismissXpFloat(id), 1100);
        },

        dismissXpFloat: (id) => set(s => ({ xpFloats: s.xpFloats.filter(f => f.id !== id) })),

        setShowReport: (v) => set({ showReport: v }),

        showLevelUpOverlay: (level) => {
          set({ showLevelUp: true, levelUpNumber: level });
          setTimeout(() => set({ showLevelUp: false }), 2600);
        },

        dismissLevelUp: () => set({ showLevelUp: false }),

        setHoveredQuest: (id) => set({ hoveredQuestId: id }),

        logEvent: (entry) => {
          const id = `l${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          const newEntry: LogEntry = { ...entry, id, ts: Date.now() };
          set(s => ({ logs: [newEntry, ...s.logs].slice(0, 500) }));
        },

        resetToCanonical: () => {
          const level = 0;
          set({
            playerName: '', setupComplete: false,
            level, xp: 0, xpToNext: playerXpToNext(level),
            title: TITLES[0], streak: 0,
            lastResetDate: todayString(),
            quests: canonicalQuests,
            skills: canonicalSkills,
            logs: [],
            rituals: [],
          });
          syncStateToServer(get());
        },

        applyData: (data) => set(s => ({ ...s, ...data })),
      };
    },
    {
      name: 'iamboss_state',
      version: CURRENT_SCHEMA_VERSION,
      migrate: (persistedState, version) => migrateAppData(persistedState, version),
      partialize: (s): AppData => ({
        playerName: s.playerName, setupComplete: s.setupComplete,
        level: s.level, xp: s.xp, xpToNext: s.xpToNext,
        title: s.title, lastResetDate: s.lastResetDate, streak: s.streak,
        quests: s.quests, skills: s.skills,
        logs: s.logs,
        rituals: s.rituals,
      }),
    }
  )
);
