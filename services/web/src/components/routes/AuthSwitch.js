import React from 'react';
import PropTypes from 'prop-types';
import { Route, Link } from 'react-router-dom';
import { Loader, Message } from 'semantic-ui-react';
import { Layout } from '../Layout';
import { withSession } from 'stores';

@withSession
export default class AuthSwitch extends React.Component {

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
    const { loggedIn: LoggedInComponent, loggedOut: LoggedOutComponent, ...rest } = this.props;
    if (loading) {
      return <Loader active>Loading</Loader>;
    } else if (error) {
      return (
        <Layout style={{ height: '100%' }} center>
          <Layout.Group>
            <Message error header="Something went wrong" content={error.message} />
            <Link to="/logout">Logout</Link>
          </Layout.Group>
        </Layout>
      );
    }
    return (
      <Route
        {...rest}
        render={(props) => {
          return this.hasAccess() ? <LoggedInComponent {...props} /> : <LoggedOutComponent {...props} />;
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
  ...Route.propTypes,
};

AuthSwitch.defaultProps = {
  admin: false,
  roles: [],
};
