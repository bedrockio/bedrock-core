import {
  Button,
  ActionIcon,
  createTheme,
  DEFAULT_THEME,
  Tabs,
} from '@mantine/core';

import './theme.less';

export const theme = createTheme({
  primaryShade: 9,
  autoContrast: true,

  luminanceThreshold: 0.3,
  primaryColor: 'green',
  fontFamily:
    'system-ui,-apple-system,BlinkMacSystemFont,Helvetica,"Segoe UI",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',

  colors: {
    brown: [
      '#fcfbfa',
      '#f4f0ea',
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
    green: [
      '#ebfbee',
      '#d3f9d8',
      '#b2f2bb',
      '#8ce99a',
      '#69db7c',
      '#51cf66',
      '#40c057',
      '#37b24d',
      '#2f9e44',
      '#2b8a3e',
      '#054011',
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
          backgroundColor: `light-dark(var(--mantine-color-brown-1), transparent)`,
        },
        header: {
          backgroundColor: `light-dark(var(--mantine-color-brown-1), transparent)`,
        },
        main: {
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
          fontSize: 'var(--mantine-font-size-sm)',
          color: 'var(--mantine-color-gray-text)',
          fontWeight: 'bold',
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
    Breadcrumbs: {
      styles: {
        root: {
          fontSize: 'var(--mantine-font-size-xs)',
        },
        breadcrumb: {
          fontSize: 'var(--mantine-font-size-xs)',
          fontWeight: '500',
          textTransform: 'uppercase',
        },
      },
    },
  },
});
