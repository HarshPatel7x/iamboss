import type { Quest, LogEntry } from '../types';

export function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseYMD(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Placeholder for future per-date scheduling. Currently every quest applies to every day.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function isQuestOnDate(_quest: Quest, _dateStr: string): boolean {
  return true;
}

export function getQuestsForDate(quests: Quest[], dateStr: string): Quest[] {
  return quests.filter(q => isQuestOnDate(q, dateStr));
}

export function getMonthGrid(year: number, month: number): { date: Date; dateStr: string; inMonth: boolean; isToday: boolean }[] {
  const today = formatYMD(new Date());
  const first = new Date(year, month, 1);
  const startOffset = first.getDay(); // Sunday = 0
  const cells: { date: Date; dateStr: string; inMonth: boolean; isToday: boolean }[] = [];

  for (let i = 0; i < 42; i++) {
    const d = new Date(year, month, 1 - startOffset + i);
    const ds = formatYMD(d);
    cells.push({
      date: d,
      dateStr: ds,
      inMonth: d.getMonth() === month,
      isToday: ds === today,
    });
  }
  return cells;
}

export function getCompletionFromLogs(logs: LogEntry[], questTitle: string, dateStr: string): boolean {
  const dayStart = parseYMD(dateStr).getTime();
  const dayEnd = dayStart + 86400000;
  return logs.some(
    log => log.type === 'quest_complete' && log.title === questTitle && log.ts >= dayStart && log.ts < dayEnd
  );
}
