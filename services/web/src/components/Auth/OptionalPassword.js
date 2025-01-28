import PasswordField from 'components/form-fields/Password';

import { AUTH_TYPE } from 'utils/env';

export default function OptionalPassword(props) {
  if (AUTH_TYPE !== 'password') {
    return null;
  }
  return <PasswordField {...props} />;
}
