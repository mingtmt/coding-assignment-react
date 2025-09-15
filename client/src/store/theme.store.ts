import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  set: (t: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: (localStorage.getItem('theme') as Theme) || 'dark',
  toggle() {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    set({ theme: next });
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  },
  set(t) {
    set({ theme: t });
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);
  },
}));
