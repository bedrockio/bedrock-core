import { useTheme } from 'contexts/theme';

import { APP_NAME } from 'utils/env';

import logoLight from 'assets/logo-light.svg';
import logoDark from 'assets/logo-dark.svg';

export default function Logo(props) {
  const { currentTheme } = useTheme();
  const src = currentTheme === 'dark' ? logoDark : logoLight;
  return <img src={src} alt={APP_NAME} {...props} />;
}
