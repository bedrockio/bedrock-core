import { Button, createTheme, DEFAULT_THEME, Tabs } from '@mantine/core';

export const theme = createTheme({
  primaryShade: 9,
  autoContrast: true,

  luminanceThreshold: 0.3,
  primaryColor: 'green',
  fontFamily: 'Inter, sans-serif',

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
    Button: Button.extend({
      defaultProps: {
        size: 'sm',
      },
    }),
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
        },
      },
    },
    Fieldset: {
      styles: {
        legend: {
          fontSize: 'var(--mantine-font-size-md)',
          color: 'var(--mantine-color-gray-5)',
        },
      },
    },
    Breadcrumbs: {
      styles: {
        root: {
          fontSize: 'var(--mantine-font-size-xs)',
        },
      },
    },
    Tabs: Tabs.extend({
      vars: () => ({
        tab: {
          '--tab-hover-color': 'transparent',
        },
      }),
      styles: {
        tab: {
          padding: 'var(--mantine-spacing-xs) 0rem',
          marginRight: 'var(--mantine-spacing-md)',
        },
      },
    }),
    NavLink: {
      styles: {
        root: {
          fontSize: 'var(--mantine-font-size-sm)',
        },
        section: {
          marginInlineEnd: 'var(--mantine-spacing-xs)',
        },
      },
    },
  },
});
