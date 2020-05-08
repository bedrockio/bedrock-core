import React from 'react';
import { Message } from 'semantic-ui-react';
//import { observer, inject } from 'mobx-react';
import { inject } from 'utils/store';
import PageCenter from 'components/PageCenter';
import PageLoader from 'components/PageLoader';
import { Route } from 'react-router-dom';

import Boot from 'components/Boot';

@inject('appSession', 'me')
export default class Protected extends React.Component {

  constructor(props) {
    super(props);
    this.handleLoading();
  }

  handleLoading() {
    const { appSession, me } = this.props;
    if (appSession.token) {
      me.fetch().then((err) => {
        if (err instanceof Error) return;
        appSession.setLoaded();
      });
      return;
    }
    appSession.setLoaded();
  }

  render() {
    const { me, appSession, component: Component, ...rest } = this.props;

    if (me.loading) {
      return (
        <PageCenter>
          {me.error && (
            <React.Fragment>
              <Message
                error
                header="Something went wrong"
                content={me.error}
              />
              <a href="/logout">Logout</a>
            </React.Fragment>
          )}
          {!me.error && <PageLoader />}
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
