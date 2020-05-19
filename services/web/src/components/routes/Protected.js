import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';
import { AppSession } from 'contexts/appSession';

import Boot from 'components/Boot';

export default class Protected extends React.Component {
  static contextType = AppSession;

  state = {
    error: null,
  };

  static propTypes = {
    admin: PropTypes.bool,
    roles: PropTypes.array,
  };

  static defaultProps = {
    admin: false,
    roles: [],
  };

  render() {
    const { component: Component, ...rest } = this.props;

    return (
      <Route
        {...rest}
        render={props => {
          return (
            <Boot {...rest}>
              <Component {...props} />
            </Boot>
          );
        }}
      />
    );
  }
}
