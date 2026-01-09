import { useNavigate } from '@bedrockio/router';
import { ActionIcon } from '@mantine/core';
import { noop } from 'lodash';
import { PiFingerprintBold } from 'react-icons/pi';

import { useSession } from 'stores/session';

import { login } from 'utils/auth/passkey';

export default function PasskeyButton(props) {
  const { onAuthStart = noop, onAuthStop = noop, onAuthError = noop } = props;

  const { authenticate } = useSession();
  const navigate = useNavigate();

  async function onClick() {
    try {
      onAuthStart();
      const result = await login();

      if (result) {
        const next = await authenticate(result.token);
        onAuthStop();
        navigate(next);
      } else {
        onAuthStop();
      }
    } catch (error) {
      onAuthError(error);
    }
  }

  return (
    <ActionIcon
      variant="default"
      radius="xl"
      size={42}
      title="Use passkey to sign in."
      onClick={onClick}>
      <PiFingerprintBold />
    </ActionIcon>
  );
}
