import React from 'react';
import PropTypes from 'prop-types';
import { omit, noop } from 'lodash';
import { Button } from 'semantic';

import { withSession } from 'stores/session';

import { disable } from 'utils/auth/apple';

@withSession
export default class DisableButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  onClick = async () => {
    let { user } = this.context;
    try {
      this.setState({
        loading: true,
      });
      user = await disable(user);
      this.setState({
        loading: false,
      });
      this.context.updateUser(user);
      this.props.onDisabled();
    } catch (error) {
      this.setState({
        loading: false,
      });
      this.props.onError(error);
    }
  };

  render() {
    const props = omit(this.props, Object.keys(DisableButton.propTypes));
    const { loading } = this.state;
    return (
      <Button
        color="red"
        size="small"
        content="Disable"
        loading={loading}
        onClick={this.onClick}
        {...props}
      />
    );
  }
}

DisableButton.propTypes = {
  onError: PropTypes.func,
  onDisabled: PropTypes.func,
};

DisableButton.defaultProps = {
  onError: noop,
  onDisabled: noop,
};
