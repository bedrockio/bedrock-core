import React from 'react';
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Button } from 'semantic';

import { withSession } from 'stores/session';

import { login } from 'utils/auth/passkey';

@withRouter
@withSession
export default class PasskeyButton extends React.Component {
  onClick = async () => {
    try {
      this.props.onAuthStart();
      const result = await login();
      this.props.onAuthStop();

      if (result) {
        const next = await this.context.authenticate(result.token);
        this.props.history.push(next);
      }
    } catch (error) {
      this.props.onAuthError(error);
    }
  };

  render() {
    return (
      <Button
        basic
        circular
        type="button"
        icon="fingerprint"
        title="Use passkey to sign in."
        onClick={this.onClick}
        style={{
          width: '42px',
          height: '42px',
          marginRight: '0',
          boxSizing: 'border-box',
        }}
      />
    );
  }
}

PasskeyButton.propTypes = {
  onAuthStart: PropTypes.func,
  onAuthStop: PropTypes.func,
  onComplete: PropTypes.func,
};

PasskeyButton.defaultProps = {
  onAuthStart: noop,
  onAuthStop: noop,
  onComplete: noop,
};
