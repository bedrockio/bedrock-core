import React from 'react';
import Connectivity from 'contexts/connectivity';
import { Message, Loader } from 'semantic';

export default class ConnectivityMessage extends React.Component {
  static contextType = Connectivity.Context;

  componentDidMount() {
    this.context.setEnabled(true);
  }

  componentWillUnmount() {
    this.context.setEnabled(false);
  }

  render() {
    if (!this.context.isOffline) return null;

    return (
      <div style={{ marginBottom: '1em' }}>
        <Message error>
          The network is unstable. Check your internet connection.{' '}
          {this.context.loading ? (
            <Loader size="tiny" active inline />
          ) : (
            <a onClick={() => this.context.testConnection()} href="#">
              Retry?
            </a>
          )}
        </Message>
      </div>
    );
  }
}
