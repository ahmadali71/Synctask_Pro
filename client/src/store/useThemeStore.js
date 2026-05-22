import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const applyTheme = (theme) => {
  const root = document.documentElement;
  const isDark = theme === 'dark';

  root.classList.toggle('dark', isDark);
  root.style.colorScheme = isDark ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);
};

const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light',

      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },

      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        applyTheme(next);
        set({ theme: next });
      },

      initTheme: () => {
        const stored = get().theme;
        applyTheme(stored || getSystemTheme());
        if (!stored) set({ theme: getSystemTheme() });

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          if (!localStorage.getItem('theme-storage')) {
            const next = e.matches ? 'dark' : 'light';
            applyTheme(next);
            set({ theme: next });
          }
        });
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.theme) applyTheme(state.theme);
      },
    }
  )
);

export default useThemeStore;
