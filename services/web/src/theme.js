import { createTheme, DEFAULT_THEME } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'primary',

  autoContrast: true,
  colors: {
    primary: [
      '#f3fbea',
      '#e7f2db',
      '#cfe3b7',
      '#b4d491',
      '#9ec670',
      '#90be5b',
      '#88ba4f',
      '#74a340',
      '#669136',
      '#567e29',
    ],
    error: DEFAULT_THEME.colors.red,
    info: DEFAULT_THEME.colors.blue,
    success: DEFAULT_THEME.colors.green,
    warning: DEFAULT_THEME.colors.orange,
    ...DEFAULT_THEME.colors,
  },
});
