import { useNavigate } from '@bedrockio/router';
import { FaApple } from 'react-icons/fa';

import { useSession } from 'stores/session';

import { Button } from '@/components/ui/button';

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
      <Button
        variant="outline"
        size="icon"
        className="size-[42px] rounded-full"
        title="Use Apple to sign in."
        onClick={onClick}>
        <FaApple />
      </Button>
    );
  }

  return (
    <Button variant="outline" className="w-full" onClick={onClick}>
      <FaApple />
      Sign in with Apple
    </Button>
  );
}
