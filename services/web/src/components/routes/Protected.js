import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';
import { withSession } from 'stores';
import AuthSwitch from './AuthSwitch';

@withSession
export default class Protected extends React.Component {

  render() {
    const { allowed: AllowedComponent, denied: DeniedComponent, ...rest } = this.props;
    return (
      <AuthSwitch
        loggedIn={AllowedComponent}
        loggedOut={DeniedComponent}
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
  denied: () => <Redirect to="/" />,
};
