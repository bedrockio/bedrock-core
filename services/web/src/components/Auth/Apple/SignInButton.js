import { useNavigate } from '@bedrockio/router';
import { ActionIcon, Button } from '@mantine/core';
import { FaApple } from 'react-icons/fa';

import { useSession } from 'stores/session';

import { signInWithApple } from 'utils/auth/apple';

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
        <FaApple />
      </ActionIcon>
    );
  }

  return (
    <Button onClick={onClick} leftSection={<FaApple />} variant="default">
      Sign in with Apple
    </Button>
  );
}
