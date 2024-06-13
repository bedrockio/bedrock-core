import { useTheme } from 'stores/theme';

import logoLight from 'assets/logo-light.svg';
import logoDark from 'assets/logo-dark.svg';

import { APP_NAME } from 'utils/env';

export default function Logo(props) {
  const { currentTheme } = useTheme();
  const src = currentTheme === 'dark' ? logoDark : logoLight;
  return <img src={src} alt={APP_NAME} {...props} />;
}
