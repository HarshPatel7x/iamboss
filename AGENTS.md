# AGENTS.md

> Conventions for AI coding agents (Claude Code, Cursor, Copilot, etc.) and human contributors working in this repo.

## Project

`iamboss` is a Solo Leveling–style HUD for daily routines. Daily tasks are quests, personal skills have levels, completing quests earns XP and levels up the player. Aesthetic: futuristic-fantasy-system window — dark, glowing, electric blue/purple panels.

## Stack

- Vite 5 + React 19 + TypeScript
- **Zustand** with `persist` middleware (no prop drilling — components read the store directly)
- No UI library — custom CSS only
- **Playwright** for end-to-end tests
- `localStorage` key `iamboss_state` (current schema version: **13**)

> **Node constraint:** Vite 6 requires Node 22.12+. Stay on `vite@5` and `@vitejs/plugin-react@4` to support Node 22.9+.

## Commands

```bash
npm run dev       # dev server → http://localhost:5173
npm run build     # tsc + vite build
npm run preview   # preview production build
npm run lint      # eslint
npm test          # playwright (headless)
npm run test:ui   # playwright UI mode
```

## Local server

Always serve from **localhost:5173**. If 5173 is occupied, kill the holding process (`lsof -ti:5173 | xargs kill`) rather than switching ports — tests and screenshot scripts assume 5173.

## Code architecture

```
src/
├── types/
│   └── index.ts           # ALL TypeScript interfaces — never scatter types in components
├── data/
│   └── canonicalData.ts   # Default quests, skills, titles — source of truth
├── store/
│   ├── useGameStore.ts    # Zustand store: all state + actions
│   ├── useComputedStats.ts# Derived stats (STR/INT/PER/HP/MP) from rituals window
│   └── migrations.ts      # persist version migrations (v1 → v13)
├── utils/
│   └── stats.ts           # Pure stat-derivation functions
├── components/
│   ├── PlayerHeader/      # Name, level, XP bar, title, HP/MP
│   ├── QuestLog/          # Daily quests + add/delete
│   ├── StatusPanel/       # Skills + add/delete
│   ├── EveningRitual/     # End-of-day ritual modal (status + journal + vitals)
│   ├── ProgressReport/    # Stats modal
│   ├── DataPanel/         # JSON editor — Apply / Reset / Export / Import
│   └── SystemMessage/     # In-world notifications
└── styles/
    └── globals.css        # CSS custom properties, fonts, panel/glow utilities
```

## State architecture

All types live in `src/types/index.ts`. Never define interfaces inline in components or the store.

```ts
// Persisted (AppData) — only these keys go to localStorage via partialize
interface AppData {
  playerName, setupComplete, level, xp, xpToNext, title,
  lastResetDate, streak,
  quests: Quest[],
  skills: Skill[],
  logs: LogEntry[],
  rituals: Ritual[]
}

// UI state (NOT persisted) — lives in the store but excluded from partialize
showLevelUp, levelUpNumber, hoveredQuestId, xpFloats
```

**Stats are derived, not persisted.** STR / INT / PER / HP / MP compute live from the `rituals` array via `utils/stats.ts::computeStats`. There is no persisted `stats` field as of v12.

**Never define initial data inline in the store.** All defaults come from `src/data/canonicalData.ts` (`canonicalQuests`, `canonicalSkills`, `TITLES`).

## Schema migrations

When you change the persisted shape:

1. Bump `CURRENT_SCHEMA_VERSION` in `src/store/migrations.ts`.
2. Add a new `if (fromVersion < N) { ... }` block.
3. **Never modify a migration block whose version has already shipped to user storage.** That block is frozen. New behavior = new version. (Why: if a user has migrated to v12 and you add a step to the v12 block, their next refresh sees `fromVersion < 12 == false` and the new step never runs.)

## Store rules

- Every state mutation goes through `useGameStore` actions — never `setState` in components.
- `partialize` only persists `AppData` fields — UI state always resets on page load.
- `resetToCanonical()` restores defaults from `canonicalData` — the universal escape hatch.
- `applyData(partial)` is used by the Data Panel for bulk edits.
- `addSkill()` returns `boolean` — `false` means duplicate, show an error and don't close the form.

## Ritual mechanics (anti-perfectionism design)

The Evening Ritual modal has three statuses per quest:

| Status  | Meaning                                | XP | Stat contribution | Streak |
|---------|----------------------------------------|----|--------------------|--------|
| Done    | Completed                              | full | counted            | preserved |
| Honest  | Tried but didn't go like planned       | 0  | none               | preserved |
| Skipped | Consciously didn't do it               | 0  | none               | preserved |

Streak driver = ritual submission. A day without a ritual log = no increment (not a reset, just no movement). There are **no penalties** — that mechanic was deliberately removed.

## Data Panel

Accessible via the ⚙ button in the header:
- Edit raw JSON state directly
- **Apply Changes** — validates JSON and calls `applyData()`
- **Reset to Source** — calls `resetToCanonical()` (two-click confirm)
- **Export** — downloads `iamboss-data-YYYY-MM-DD.json` (gitignored — personal data)
- **Import** — load a JSON file, then Apply

Imports run through `migrateAppData()` so older exports auto-upgrade.

## UI rules

- Dark only: `#0a0a0f` base, `#0d0d1a` panels, `#00d4ff` / `#7c3aed` glows
- Fonts: `Rajdhani` / `Orbitron` (headings/stats) + `Inter` (body) — never the same font for both
- Shadows: layered + color-tinted — never flat
- Animate only `transform` and `opacity` — never `transition: all`
- Every interactive element: hover glow-shift + active scale-down + focus-visible ring
- Respect `prefers-reduced-motion`
- Quest category colors: ritual `#7c3aed`, body `#d85a30`, work `#0f9c6e`, skill `#2b7de9`, mind `#d4920a`, recovery `#606880`

## Testing

Playwright specs live in `tests/`. Run `npm test`. When changing persisted shape or ritual mechanics, update or add a spec — the test suite is the regression net for save-data integrity.

## Accessibility

- WCAG AA contrast on all text
- Keyboard reachability on every interactive control
- `aria-label` on icon-only buttons
- Tooltips never block keyboard navigation
