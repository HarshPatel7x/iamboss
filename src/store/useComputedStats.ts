import { useMemo } from 'react';
import { useGameStore } from './useGameStore';
import { computeStats, type ComputedStats } from '../utils/stats';

function todayString() {
  return new Date().toISOString().split('T')[0];
}

export function useComputedStats(): ComputedStats {
  const rituals = useGameStore(s => s.rituals);
  const quests = useGameStore(s => s.quests);
  return useMemo(() => computeStats(rituals, quests, todayString()), [rituals, quests]);
}
