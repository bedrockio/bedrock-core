import { useNavigate } from '@bedrockio/router';

import { useSession } from 'stores/session';
import { useClass } from 'helpers/bem';

import { signInWithGoogle } from 'utils/auth/google';

import logo from 'assets/google-logo.svg';

export default function GoogleSignInButton(props) {
  const { type } = props;
  const { onAuthStart, onAuthStop, onError } = props;

  const { className, getElementClass } = useClass(`google-${type}-button`);

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

  return (
    <div className={className} onClick={onClick}>
      <img src={logo} className={getElementClass('logo')} />
      {type === 'signup' && (
        <div className={getElementClass('text')}>Sign up with Google</div>
      )}
    </div>
  );
}
