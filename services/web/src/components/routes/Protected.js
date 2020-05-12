import React from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import { Message } from 'semantic-ui-react';
import { Route } from 'react-router-dom';
import PageCenter from 'components/PageCenter';
import PageLoader from 'components/PageLoader';
import NotFound from 'components/NotFound';

import Boot from 'components/Boot';

@inject('appSession', 'me')
@observer
export default class Protected extends React.Component {

  constructor(props) {
    super(props);
    this.handleLoading();
  }

  handleLoading() {
    const { appSession, me } = this.props;
    if (appSession.token) {
      me.fetch('boot').then((err) => {
        if (err instanceof Error) return;
        appSession.setLoaded();
      });
      return;
    }
    appSession.setLoaded();
  }

  hasAccess() {
    const { me } = this.props;
    if (!me.user) {
      return false;
    }
    return this.getRoles().every((role) => {
      return me.hasRole(role);
    });
  }

  getRoles() {
    const { admin, roles } = this.props;
    return admin ? ['admin'] : roles;
  }

  render() {
    const { me, appSession, component: Component, ...rest } = this.props;
    const status = me.getStatus('boot');

    if (!appSession.loaded) {
      return (
        <PageCenter>
          {status.error && (
            <React.Fragment>
              <Message
                error
                header="Something went wrong"
                content={status.error.message}
              />
              <a href="/logout">Logout</a>
            </React.Fragment>
          )}
          {!status.error && <PageLoader />}
        </PageCenter>
      );
    } else if (!this.hasAccess()) {
      return (
        <NotFound />
      );
    }

    return (
      <Route
        {...rest}
        render={(props) => {
          return (
            <Boot>
              <Component {...props} />
            </Boot>
          );
        }}
      />
    );
  }
}

Protected.propTypes = {
  admin: PropTypes.bool,
  roles: PropTypes.array,
};

Protected.defaultProps = {
  admin: false,
  roles: [],
};
