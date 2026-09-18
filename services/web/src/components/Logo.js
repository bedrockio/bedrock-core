import { useTheme } from '@/components/ThemeProvider';

import logoDark from 'assets/logo-dark.svg';
import logoLight from 'assets/logo-light.svg';

import { APP_NAME } from 'utils/env';

export default function Logo({ height, style, ...props }) {
  const { resolvedTheme } = useTheme();

  return (
    <img
      src={resolvedTheme === 'dark' ? logoDark : logoLight}
      alt={APP_NAME}
      // Tailwind's preflight sets `img { height: auto }`, which beats the
      // HTML `height` attribute — apply it as an inline style instead so it
      // actually constrains the rendered size (width follows via aspect ratio).
      style={height ? { height, width: 'auto', ...style } : style}
      {...props}
    />
  );
}
