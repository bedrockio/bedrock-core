import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';

import AuthSwitch from './AuthSwitch';

export default class Protected extends React.Component {
  render() {
    const {
      allowed: AllowedComponent,
      denied: DeniedComponent,
      loggedOut: LoggedOutComponent,
      ...rest
    } = this.props;
    return (
      <AuthSwitch
        capture
        denied={DeniedComponent}
        loggedIn={AllowedComponent}
        loggedOut={LoggedOutComponent}
        {...rest}
      />
    );
  }
}

Protected.propTypes = {
  admin: PropTypes.bool,
  roles: PropTypes.array,
  allowed: PropTypes.elementType.isRequired,
  denied: PropTypes.oneOfType([PropTypes.elementType, PropTypes.string]),
  ...Route.propTypes,
};

Protected.defaultProps = {
  loggedOut: () => {
    return <Redirect to="/login" />;
  },
  denied: () => {
    return <Redirect to="/" />;
  },
};
