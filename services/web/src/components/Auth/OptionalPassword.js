import { PasswordInput } from '@mantine/core';

import { AUTH_TYPE } from 'utils/env';

export default function OptionalPassword(props) {
  if (AUTH_TYPE !== 'password') {
    return null;
  }
  return <PasswordInput {...props} />;
}
