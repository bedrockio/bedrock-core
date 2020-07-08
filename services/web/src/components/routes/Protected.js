import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';
import { withSession } from 'stores';
import AuthSwitch from './AuthSwitch';

@withSession
export default class Protected extends React.Component {

  hasAccess() {
    const { user, hasRole } = this.context;
    if (!user) {
      return false;
    }
    return this.getRoles().every((role) => {
      return hasRole(role);
    });
  }

  getRoles() {
    const { admin, roles } = this.props;
    return admin ? ['admin'] : roles;
  }

  render() {
    const { exact, path } = this.props;
    return (
      <AuthSwitch
        exact={exact}
        path={path}
        loggedOut={(props) => this.renderAccessDenied(props)}
        loggedIn={(props) => this.renderLoggedIn(props)}
      />
    );
  }

  renderLoggedIn(props) {
    const { allowed: AllowedComponent } = this.props;
    if (this.hasAccess()) {
      return <AllowedComponent {...props} />;
    } else {
      return this.renderAccessDenied(props);
    }
  }

  renderAccessDenied(props) {
    const { denied: DeniedComponent } = this.props;
    if (DeniedComponent) {
      return <DeniedComponent {...props} />;
    } else {
      return <Redirect to={'/'} />;
    }
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
  admin: false,
  roles: [],
};
