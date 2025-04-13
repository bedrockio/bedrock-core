import { createTheme, DEFAULT_THEME } from '@mantine/core';

export const theme = createTheme({
  primaryShade: 6,
  autoContrast: true,
  primaryColor: 'primary',
  luminanceThreshold: 0.3,
  colors: {
    primary: [
      '#2a832a',
      '#2a832a',
      '#2a832a',
      '#2a832a',
      '#2a832a',
      '#2a832a',
      '#2a832a',
      '#2a832a',
      '#2a832a',
      '#2a832a',
    ],
    error: DEFAULT_THEME.colors.red,
    info: DEFAULT_THEME.colors.blue,
    success: DEFAULT_THEME.colors.green,
    warning: DEFAULT_THEME.colors.orange,
  },
  components: {
    AppShell: {
      styles: {
        navbar: {
          backgroundColor: '#f4f0eb',
        },
        header: {
          backgroundColor: '#f4f0eb',
        },
      },
    },
  },
});
