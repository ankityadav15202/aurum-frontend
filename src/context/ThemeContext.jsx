import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CATS } from '../utils/constants.js';

const STORAGE_KEY = 'aurum_theme';
const META_COLOR  = { light: '#FAFAF9', dark: '#0C0C0D' };

const ThemeContext = createContext(null);

const readPreference = () => {
  try { return localStorage.getItem(STORAGE_KEY) || 'system'; } catch { return 'system'; }
};

const systemPrefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(readPreference);
  const [systemDark, setSystemDark]      = useState(systemPrefersDark);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = e => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const theme = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;

  // Set synchronously (not in an effect) so children that read computed
  // styles during this render - useChartColors - see the new theme's values.
  if (document.documentElement.getAttribute('data-theme') !== theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLOR[theme]);
  }, [theme]);

  const setPreference = (value) => {
    setPreferenceState(value);
    try { localStorage.setItem(STORAGE_KEY, value); } catch {}
  };

  return (
    <ThemeContext.Provider value={{ preference, setPreference, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

// Recharts writes colors into SVG attributes, which can't resolve CSS variables,
// so resolve the tokens to concrete values whenever the theme changes.
export function useChartColors() {
  const { theme } = useTheme();
  return useMemo(() => {
    const css = getComputedStyle(document.documentElement);
    const v = name => css.getPropertyValue(name).trim();
    return {
      text:     v('--text'),
      text2:    v('--text-2'),
      text3:    v('--text-3'),
      grid:     v('--grid'),
      border:   v('--border'),
      muted:    v('--border-strong'),
      surface:  v('--surface'),
      accent:   v('--accent'),
      negative: v('--negative'),
      warning:  v('--warning'),
      positive: v('--positive'),
      cat: Object.fromEntries(CATS.map(c => [c.id, v(`--cat-${c.id}`)])),
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);
}
