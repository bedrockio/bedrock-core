import { APP_NAME } from 'utils/env';

import logoIcon from 'assets/logo-icon.svg';

export default function AuthLogo() {
  return <img src={logoIcon} alt={APP_NAME} className="mb-6 size-10" />;
}
