import React from 'react';
import { noop } from 'lodash';
import { withRouter } from 'react-router-dom';

import { withSession } from 'stores';

import { initialize, login, enable } from './utils';

@withRouter
@withSession
export default class AppleSignInButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  componentDidMount() {
    this.load();
    document.addEventListener('AppleIDSignInOnSuccess', this.onSuccess);
    document.addEventListener('AppleIDSignInOnFailure', this.onFailure);
  }

  componentWillUnmount() {
    document.removeEventListener('AppleIDSignInOnSuccess', this.onSuccess);
    document.removeEventListener('AppleIDSignInOnFailure', this.onFailure);
  }

  load = async () => {
    await initialize();
  };

  onSuccess = async (evt) => {
    this.props.onVerifyStart();
    const { id_token: token } = evt.detail.authorization;
    const { firstName, lastName } = evt.detail.user?.name || {};
    if (this.context.isLoggedIn()) {
      await this.enableSignIn(token);
    } else {
      await this.attemptLogin(token, {
        firstName,
        lastName,
      });
    }
  };

  enableSignIn = async (token) => {
    this.props.onVerifyStart();
    const user = await enable(token);
    this.props.onVerifyStop();
    this.context.updateUser(user);
    this.props.onComplete();
  };

  attemptLogin = async (token, body) => {
    this.props.onVerifyStart();
    const result = await login(token);
    this.props.onVerifyStop();
    if (result.token) {
      const next = await this.context.authenticate(result.token);
      this.props.history.push(next);
    } else if (result.next === 'signup') {
      this.props.history.push('/signup', {
        type: 'apple',
        body: {
          token,
          ...body,
        },
      });
    }
  };

  onFailure = (evt) => {
    this.props.onError?.(evt.detail.error);
  };

  render() {
    if (this.props.small) {
      return this.renderSmall();
    } else {
      return this.renderNormal();
    }
  }

  renderSmall() {
    return (
      <div
        style={{
          width: '40px',
          height: '40px',
          cursor: 'pointer',
          display: 'inline-flex',
        }}
        id="appleid-signin"
        data-mode="logo-only"
        data-color="black"
        data-border="false"
        data-border-radius="50"
        data-type="sign in"
      />
    );
  }

  renderNormal() {
    return (
      <div
        style={{
          cursor: 'pointer',
        }}
        id="appleid-signin"
        data-mode="left-align"
        data-logo-size="large"
        data-logo-position="10"
        data-label-position="40"
        data-type="sign in"
        data-width="175"
        data-height="32"
      />
    );
  }
}

AppleSignInButton.defaultProps = {
  onVerifyStart: noop,
  onVerifyStop: noop,
};
