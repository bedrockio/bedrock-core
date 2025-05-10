import { Divider, Stack } from '@mantine/core';

import { canShowGoogleSignin } from 'utils/auth/google';
import { canShowAppleSignin } from 'utils/auth/apple';
import { canShowPasskey } from 'utils/auth/passkey';

import PasskeyButton from './PasskeyButton';
import GoogleButton from './Google/SignInButton';
import AppleButton from './Apple/SignInButton';

import { Group } from '@mantine/core';
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
