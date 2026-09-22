import { useNavigate } from '@bedrockio/router';

import { useSession } from 'stores/session';

import logo from 'assets/google-logo.svg';

import { Button } from '@/components/ui/button';

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
      <Button
        variant="outline"
        size="icon"
        className="size-[42px] rounded-full"
        title="Use Apple to sign in."
        onClick={onClick}>
        <img src={logo} alt="Google" height={16} />
      </Button>
    );
  }

  return (
    <Button variant="outline" className="w-full" onClick={onClick}>
      <img src={logo} alt="Google" height={13} />
      Sign in with Google
    </Button>
  );
}
