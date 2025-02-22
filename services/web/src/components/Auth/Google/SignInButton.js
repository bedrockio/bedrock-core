import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { noop } from 'lodash';

import { withSession } from 'contexts/session';

import { renderButton, login, enable } from './utils';

@withRouter
@withSession
export default class GoogleSignInButton extends React.Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
  }

  componentDidMount() {
    this.load();
  }

  load = async () => {
    await renderButton(this.ref.current, {
      onAuthenticated: this.onAuthenticated,
      ...this.getRenderProps(),
    });
  };

  getRenderProps() {
    if (this.props.small) {
      return {
        type: 'icon',
        shape: 'circle',
      };
    } else {
      return {
        type: 'standard',
        size: 'medium',
      };
    }
  }

  onAuthenticated = async (response) => {
    const token = response.credential;
    if (this.context.isLoggedIn()) {
      await this.enableSignIn(token);
    } else {
      await this.attemptLogin(token);
    }
  };

  enableSignIn = async (token) => {
    this.props.onVerifyStart();
    const user = await enable(token);
    this.props.onVerifyStop();
    this.context.updateUser(user);
    this.props.onComplete();
  };

  attemptLogin = async (token) => {
    this.props.onVerifyStart();
    const result = await login(token);
    this.props.onVerifyStop();
    if (result.token) {
      const next = await this.context.authenticate(result.token);
      this.props.history.push(next);
    } else if (result.next === 'signup') {
      this.props.history.push('/signup', {
        type: 'google',
        body: {
          token,
          ...result.body,
        },
      });
    }
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
        ref={this.ref}
        style={{
          width: '44px',
          height: '44px',
          display: 'inline-flex',
        }}
      />
    );
  }

  renderNormal() {
    return <div ref={this.ref} />;
  }
}

GoogleSignInButton.propTypes = {
  small: PropTypes.bool,
  onVerifyStart: PropTypes.func,
  onVerifyStop: PropTypes.func,
  onComplete: PropTypes.func,
};

GoogleSignInButton.defaultProps = {
  small: false,
  onVerifyStart: noop,
  onVerifyStop: noop,
  onComplete: noop,
};
