import { create } from 'zustand';
import type { Theme } from '../types';

interface ThemeState {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'aurea-theme-preference';

function applyTheme(theme: Theme): boolean {
  if (typeof window === 'undefined') return true;
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');

  let isDark = false;
  if (theme === 'SYSTEM') {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  } else {
    isDark = theme === 'DARK';
  }

  root.classList.add(isDark ? 'dark' : 'light');
  return isDark;
}

function loadInitialTheme(): { theme: Theme; isDark: boolean } {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const theme: Theme = saved && ['LIGHT', 'DARK', 'SYSTEM'].includes(saved) ? saved : 'DARK';
    const isDark = applyTheme(theme);
    return { theme, isDark };
  } catch {
    const isDark = applyTheme('DARK');
    return { theme: 'DARK', isDark };
  }
}

const initial = loadInitialTheme();

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initial.theme,
  isDark: initial.isDark,

  setTheme: (theme: Theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
    const isDark = applyTheme(theme);
    set({ theme, isDark });
  },

  toggleTheme: () => {
    const current = get().theme;
    const next: Theme = current === 'DARK' ? 'LIGHT' : 'DARK';
    get().setTheme(next);
  },
}));
