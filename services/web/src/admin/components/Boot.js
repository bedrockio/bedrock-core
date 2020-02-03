import React from 'react';
import { Switch, withRouter } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import PageCenter from './PageCenter';
import PageLoader from './PageLoader';
import { Message, Button } from 'semantic-ui-react';

@inject('appSession', 'me')
@withRouter
@observer
export default class Boot extends React.Component {
  componentWillMount() {
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
    const { me, appSession } = this.props;
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

    return this.props.children;
  }
}
