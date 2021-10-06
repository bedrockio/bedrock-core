import React from 'react';
import { pick, omit } from 'lodash';
import PropTypes from 'prop-types';
import { Route, Link } from 'react-router-dom';
import { Loader, Message } from 'semantic';
import { withSession } from 'stores';
import ErrorScreen from 'screens/Error';

// Need to hard-code these as react-router
// strips them in production 👎
const ROUTE_PROP_TYPES = [
  'children',
  'component',
  'exact',
  'location',
  'path',
  'render',
  'sensitive',
  'strict',
];

class AuthSwitch extends React.Component {
  hasAccess() {
    const { admin, roles } = this.props;
    const { user, isAdmin, hasRoles } = this.context;
    if (!user) {
      return false;
    } else if (admin) {
      return isAdmin();
    } else if (roles.length) {
      return hasRoles(roles);
    }
    return true;
  }

  render() {
    const { loading, error } = this.context;
    const {
      loggedIn: LoggedInComponent,
      loggedOut: LoggedOutComponent,
    } = this.props;
    if (loading) {
      return <Loader active>Loading</Loader>;
    } else if (error) {
      return (
        <ErrorScreen>
          <Message
            error
            header="Something went wrong"
            content={error.message}
          />
          <Link to="/logout">Logout</Link>
        </ErrorScreen>
      );
    }
    const routeProps = pick(this.props, ROUTE_PROP_TYPES);
    const passedProps = omit(this.props, Object.keys(AuthSwitch.propTypes));
    return (
      <Route
        {...routeProps}
        render={(props) => {
          return this.hasAccess() ? (
            <LoggedInComponent {...props} {...passedProps} />
          ) : (
            <LoggedOutComponent {...props} {...passedProps} />
          );
        }}
      />
    );
  }
}

AuthSwitch.propTypes = {
  admin: PropTypes.bool,
  roles: PropTypes.array,
  loggedIn: PropTypes.elementType.isRequired,
  loggedOut: PropTypes.elementType.isRequired,
};

AuthSwitch.defaultProps = {
  admin: false,
  roles: [],
};

export default withSession(AuthSwitch);
