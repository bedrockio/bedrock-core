import { createTheme } from '@mantine/core';

import { DEFAULT_THEME } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'green',
  /** Put your mantine theme override here */
  fontSizes: {
    xs: 'calc(0.75rem * var(--mantine-scale))',
    sm: 'calc(0.875rem * var(--mantine-scale))',
    md: 'calc(1rem * var(--mantine-scale))',
    lg: 'calc(1.125rem * var(--mantine-scale))',
    xl: 'calc(1.25rem * var(--mantine-scale))',
  },
});
