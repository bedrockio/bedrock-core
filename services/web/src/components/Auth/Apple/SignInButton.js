import { useNavigate } from '@bedrockio/router';

import { useSession } from 'stores/session';
import { useClass } from 'helpers/bem';

import { signInWithApple } from 'utils/auth/apple';

import logo from 'assets/apple-logo-white.svg';

import './apple.less';

export default function AppleSignInButton(props) {
  const { type } = props;
  const { onAuthStart, onAuthStop, onError } = props;

  const { className, getElementClass } = useClass(`apple-${type}-button`);

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

  return (
    <div className={className} onClick={onClick}>
      <img src={logo} className={getElementClass('logo')} />
      {type === 'signup' && (
        <div className={getElementClass('text')}>Sign up with Apple</div>
      )}
    </div>
  );
}
