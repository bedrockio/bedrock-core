import { useTheme } from '@/components/ThemeProvider';

import logoDark from 'assets/logo-dark.svg';
import logoLight from 'assets/logo-light.svg';

import { APP_NAME } from 'utils/env';

export default function Logo(props) {
  const { resolvedTheme } = useTheme();

  return (
    <img
      src={resolvedTheme === 'dark' ? logoDark : logoLight}
      alt={APP_NAME}
      {...props}
    />
  );
}
