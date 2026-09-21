import * as React from 'react';

/**
 * Minimal theme provider for shadcn/ui dark mode. Toggles the `.dark` class on
 * <html>. Defaults to `system` so a visitor who has never touched the theme
 * dropdown — including on the logged-out auth screens — gets their OS/browser
 * preference instead of a hard-coded light. `index.html` applies the same
 * resolution synchronously before first paint to avoid a flash of the wrong
 * theme; this provider takes over from there and stays live if the OS
 * preference changes while the tab is open.
 */
const ThemeContext = React.createContext({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
});

function getSystemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
    ? 'dark'
    : 'light';
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
}) {
  const [theme, setThemeState] = React.useState(() => {
    try {
      return window.localStorage.getItem(storageKey) || defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  const [systemTheme, setSystemTheme] = React.useState(getSystemTheme);

  React.useEffect(() => {
    const mql = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mql) {
      return;
    }
    const onChange = () => setSystemTheme(mql.matches ? 'dark' : 'light');
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
  }, [resolvedTheme]);

  const setTheme = React.useCallback(
    (next) => {
      try {
        window.localStorage.setItem(storageKey, next);
      } catch {
        // ignore (private mode / disabled storage)
      }
      setThemeState(next);
    },
    [storageKey],
  );

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme() {
  return React.use(ThemeContext);
}
