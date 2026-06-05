import * as React from 'react';

/**
 * Minimal theme provider for shadcn/ui dark mode. Toggles the `.dark` class on
 * <html>. Defaults to `light` to stay consistent with Mantine (which renders
 * light by default) during coexistence; a full toggle + `system` support lands
 * with the Mantine teardown.
 */
const ThemeContext = React.createContext({
  theme: 'light',
  resolvedTheme: 'light',
  setTheme: () => {},
});

function getSystemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'theme',
}) {
  const [theme, setThemeState] = React.useState(() => {
    try {
      return window.localStorage.getItem(storageKey) || defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;

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

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return React.useContext(ThemeContext);
}
