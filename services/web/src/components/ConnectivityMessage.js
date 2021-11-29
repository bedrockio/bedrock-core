import React from 'react';
import Connectivity from 'contexts/connectivity';
import { Message, Loader } from 'semantic';

export default class ConnectivityMessage extends React.Component {
  static contextType = Connectivity.Context;

  state = {
    loading: false,
  };

  componentDidMount() {
    this.context.setEnabled(true);
  }

  componentWillUnmount() {
    this.context.setEnabled(false);
  }

  async handleLoading(e) {
    e.preventDefault();
    this.setState({ loading: true });
    await this.context.testConnection();
    this.setState({ loading: false });
  }

  render() {
    if (!this.context.isOffline) return null;

    return (
      <div style={{ marginBottom: '1em' }}>
        <Message error>
          The network is unstable. Check your internet connection.{' '}
          {this.state.loading ? (
            <Loader size="tiny" active inline />
          ) : (
            <a onClick={this.handleLoading} href="#">
              Retry?
            </a>
          )}
        </Message>
      </div>
    );
  }
}
