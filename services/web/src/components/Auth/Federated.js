import { canShowAppleSignin } from 'utils/auth/apple';
import { canShowGoogleSignin } from 'utils/auth/google';
import { canShowPasskey } from 'utils/auth/passkey';

import AppleButton from './Apple/SignInButton';
import GoogleButton from './Google/SignInButton';
import PasskeyButton from './PasskeyButton';

export default function Federated(props) {
  const { type } = props;

  const isSignup = type === 'signup';

  const showApple = canShowAppleSignin();
  const showGoogle = canShowGoogleSignin();
  const showPasskey = !isSignup && canShowPasskey();

  if (!showApple && !showGoogle && !showPasskey) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="bg-border h-px flex-1" />
        <span className="text-muted-foreground text-xs">OR</span>
        <div className="bg-border h-px flex-1" />
      </div>
      <div
        className={
          isSignup
            ? 'flex flex-col gap-3'
            : 'flex gap-3 [&>*]:flex-1 [&>*]:justify-center'
        }>
        {showPasskey && <PasskeyButton {...props} />}
        {showGoogle && <GoogleButton {...props} />}
        {showApple && <AppleButton {...props} />}
      </div>
    </>
  );
}
