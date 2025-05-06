import { useNavigate } from '@bedrockio/router';
import { useSession } from 'stores/session';
import { signInWithApple } from 'utils/auth/apple';
import { ActionIcon, Button } from '@mantine/core';

import { IconBrandAppleFilled } from '@tabler/icons-react';

export default function AppleSignInButton({
  onAuthStart,
  onAuthStop,
  onError,
  type,
}) {
  const navigate = useNavigate();
  const { authenticate } = useSession();

  async function onClick() {
    try {
      onAuthStart();
      const response = await signInWithApple();
      onAuthStop();
      if (response) {
        let path = await authenticate(response.token);
        if (response.result === 'signup') {
          path = '/onboard';
        }
        navigate.push(path);
      }
    } catch (error) {
      onError(error);
    }
  }

  if (type === 'login') {
    return (
      <ActionIcon
        variant="default"
        radius="xl"
        size={42}
        title="Use Apple to sign in."
        onClick={onClick}>
        <IconBrandAppleFilled />
      </ActionIcon>
    );
  }

  return (
    <Button
      onClick={onClick}
      leftSection={<IconBrandAppleFilled size={16} />}
      variant="default">
      Sign in with Apple
    </Button>
  );
}
