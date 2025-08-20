import { useNavigate } from '@bedrockio/router';
import { ActionIcon, Button } from '@mantine/core';

import { useSession } from 'stores/session';

import logo from 'assets/google-logo.svg';

import { signInWithGoogle } from 'utils/auth/google';

export default function GoogleSignInButton({
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
      const response = await signInWithGoogle();
      onAuthStop();
      if (response) {
        let path = await authenticate(response.token);
        if (response.result === 'signup') {
          path = '/onboard';
        }
        navigate(path);
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
        <img src={logo} alt="Google" height={16} />
      </ActionIcon>
    );
  }

  return (
    <Button
      onClick={onClick}
      leftSection={<img src={logo} alt="Google" height={13} />}
      variant="default">
      Sign in with Google
    </Button>
  );
}
