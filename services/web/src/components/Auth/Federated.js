import React from 'react';
import { Divider } from 'semantic';

import { canShowGoogleSignin } from 'components/Auth/Google/utils';
import { canShowAppleSignin } from 'components/Auth/Apple/utils';

import GoogleButton from './Google/SignInButton';
import AppleButton from './Apple/SignInButton';

export default function FederatedLogin(props) {
  const showApple = canShowAppleSignin();
  const showGoogle = canShowGoogleSignin();

  if (!showApple && !showGoogle) {
    return null;
  }

  return (
    <React.Fragment>
      <Divider horizontal>Or</Divider>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
        }}>
        {showGoogle && <GoogleButton small {...props} />}
        {showApple && <AppleButton small {...props} />}
      </div>
    </React.Fragment>
  );
}
