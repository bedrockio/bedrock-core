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
    brown: [
      '#f8f5f2',
      '#ebe9e6',
      '#d7d0c7',
      '#c3b5a4',
      '#b29f87',
      '#a89074',
      '#a48969',
      '#8f7658',
      '#80694c',
      '#70593e',
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
