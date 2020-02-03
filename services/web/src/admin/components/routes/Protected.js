import React from 'react';
import { Message } from 'semantic-ui-react';
import { observer, inject } from 'mobx-react';
import PageCenter from 'components/PageCenter';
import PageLoader from 'components/PageLoader';
import { Route } from 'react-router-dom';

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
