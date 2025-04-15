import { createTheme, DEFAULT_THEME } from '@mantine/core';

export const theme = createTheme({
  primaryShade: 9,
  autoContrast: true,

  luminanceThreshold: 0.3,
  primaryColor: 'green',
  colors: {
    brown: [
      '#f7f5f2',
      '#e8e1d6',
      '#d8cfc0',
      '#c8bda9',
      '#b8ab93',
      '#a89a7d',
      '#99896a',
      '#8a7857',
      '#7b673f',
      '#6c5629',
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
          backgroundColor: `light-dark(var(--mantine-color-brown-0), transparent)`,
        },
        header: {
          backgroundColor: `light-dark(var(--mantine-color-brown-0), transparent)`,
        },
      },
    },
    Anchor: {
      styles: {
        root: {
          color: 'var(--mantine-color-text)',
          '&:hover': {
            color: 'var(--mantine-color-primary)',
          },
        },
      },
    },
    Fieldset: {
      styles: {
        legend: {
          fontSize: 'var(--mantine-font-size-md)',
          fontWeight: 500,
        },
      },
    },
  },
});
