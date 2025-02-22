import React from 'react';
import { pick, omit } from 'lodash';
import PropTypes from 'prop-types';
import { Route, Link } from 'react-router-dom';
import { Loader, Message } from 'semantic';

import { useSession } from 'contexts/session';

import ErrorScreen from 'screens/Error';

// XXX Need to hard-code these as react-router
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

const AuthSwitch = ({
  admin,
  roles,
  captureRedirect,
  loggedIn: LoggedInComponent,
  loggedOut: LoggedOutComponent,
  denied: DeniedComponent,
  ...props
}) => {
  const { loading, error, isLoggedIn, isAdmin, hasRoles, pushRedirect } =
    useSession();

  const hasAccess = () => {
    if (!isLoggedIn()) {
      return false;
    } else if (admin) {
      return isAdmin();
    } else if (roles.length) {
      return hasRoles(roles);
    }
    return true;
  };

  if (loading) {
    return <Loader active>Loading</Loader>;
  } else if (error) {
    return (
      <ErrorScreen>
        <Message error header="Something went wrong" content={error.message} />
        <Link to="/logout">Logout</Link>
      </ErrorScreen>
    );
  }

  const routeProps = pick(props, ROUTE_PROP_TYPES);
  const passedProps = omit(props, Object.keys(AuthSwitch.propTypes));

  return (
    <Route
      {...routeProps}
      render={(routeProps) => {
        if (!isLoggedIn()) {
          if (captureRedirect) {
            pushRedirect();
          }
          return <LoggedOutComponent {...routeProps} {...passedProps} />;
        } else if (!hasAccess()) {
          return <DeniedComponent {...routeProps} {...passedProps} />;
        } else {
          return <LoggedInComponent {...routeProps} {...passedProps} />;
        }
      }}
    />
  );
};

AuthSwitch.propTypes = {
  admin: PropTypes.bool,
  roles: PropTypes.array,
  captureRedirect: PropTypes.bool,
  denied: PropTypes.elementType,
  loggedIn: PropTypes.elementType.isRequired,
  loggedOut: PropTypes.elementType.isRequired,
};

AuthSwitch.defaultProps = {
  admin: false,
  captureRedirect: false,
  roles: [],
};
