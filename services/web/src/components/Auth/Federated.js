import { Divider, Group, Stack } from '@mantine/core';

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

  const Wrapper = type === 'signup' ? Stack : Group;

  return (
    <>
      <Divider labelPosition="center" label="OR" />
      <Wrapper grow>
        {showPasskey && <PasskeyButton {...props} />}
        {showGoogle && <GoogleButton {...props} />}
        {showApple && <AppleButton {...props} />}
      </Wrapper>
    </>
  );
}
