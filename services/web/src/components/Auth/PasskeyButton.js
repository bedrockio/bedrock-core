import { useNavigate } from '@bedrockio/router';
import { noop } from 'lodash';
import { PiFingerprintBold } from 'react-icons/pi';

import { useSession } from 'stores/session';

import { Button } from '@/components/ui/button';

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
    <Button
      variant="outline"
      size="icon"
      className="size-[42px] rounded-full"
      title="Use passkey to sign in."
      onClick={onClick}>
      <PiFingerprintBold />
    </Button>
  );
}
