import React from 'react';
import PropTypes from 'prop-types';
import { Route, Link } from 'react-router-dom';
import { Message } from 'semantic-ui-react';
import { withSession } from 'stores';
import PageCenter from '../PageCenter';
import PageLoader from '../PageLoader';

@withSession
export default class AuthSwitch extends React.Component {

  render() {
    const { user, loading, error } = this.context;
    const { loggedIn: LoggedInComponent, loggedOut: LoggedOutComponent, ...rest } = this.props;
    if (error || loading) {
      return (
        <PageCenter>
          {error && (
            <React.Fragment>
              <Message
                error
                header="Something went wrong"
                content={error.message}
              />
              <Link to="/logout">Logout</Link>
            </React.Fragment>
          )}
          {loading && <PageLoader />}
        </PageCenter>
      );
    }
    return (
      <Route
        {...rest}
        render={(props) => {
          return user ? <LoggedInComponent {...props} /> : <LoggedOutComponent {...props} />;
        }}
      />
    );
  }
}

AuthSwitch.propTypes = {
  loggedIn: PropTypes.elementType.isRequired,
  loggedOut: PropTypes.elementType.isRequired,
  ...Route.propTypes,
};
