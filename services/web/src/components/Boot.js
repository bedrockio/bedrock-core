import React from 'react';
import { Switch, withRouter } from 'react-router-dom';
//import { observer, inject } from 'mobx-react';
import { inject } from 'utils/store';
import PageCenter from 'components/PageCenter';
import PageLoader from 'components/PageLoader';
import { Message, Button } from 'semantic-ui-react';

@inject('appSession', 'me')
export default class Boot extends React.Component {

  componentDidMount() {
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

    if (me.loading) {
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
