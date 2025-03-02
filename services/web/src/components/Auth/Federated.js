import React from 'react';
import { Divider } from 'semantic';

import { canShowGoogleSignin } from 'utils/auth/google';
import { canShowAppleSignin } from 'utils/auth/apple';
import { canShowPasskey } from 'utils/auth/passkey';

import PasskeyButton from './PasskeyButton';
import GoogleButton from './Google/SignInButton';
import AppleButton from './Apple/SignInButton';

export default function Federated(props) {
  const { type } = props;

  const isSignup = type === 'signup';

  const showApple = canShowAppleSignin();
  const showGoogle = true; // canShowGoogleSignin();
  const showPasskey = !isSignup && canShowPasskey();

  if (!showApple && !showGoogle && !showPasskey) {
    return null;
  }

  return (
    <React.Fragment>
      <Divider horizontal>Or</Divider>
      <Container {...props}>
        {showPasskey && <PasskeyButton {...props} />}
        {showGoogle && <GoogleButton {...props} />}
        {showApple && <AppleButton {...props} />}
      </Container>
    </React.Fragment>
  );
}

function Container(props) {
  if (props.type === 'login') {
    return (
      <div
        style={{
          display: 'grid',
          gap: '10px',
          justifyContent: 'center',
          gridTemplateColumns: 'repeat(auto-fit, 44px)',
        }}>
        {props.children}
      </div>
    );
  } else {
    return (
      <div
        style={{
          display: 'flex',
          flexFlow: 'column',
          gap: '10px',
        }}>
        {props.children}
      </div>
    );
  }
}
