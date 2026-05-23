import { create } from 'zustand';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'iamboss_theme';

function readTheme(): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* private mode — ignore */ }
}

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
}

export const useTheme = create<ThemeStore>((set, get) => ({
  theme: readTheme(),
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    set({ theme: next });
  },
}));
