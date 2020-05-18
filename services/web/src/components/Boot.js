import React from 'react';
import inject from 'stores/inject';
import PageCenter from 'components/PageCenter';
import PageLoader from 'components/PageLoader';
import { Message } from 'semantic-ui-react';

@inject('session', 'me')
export default class Boot extends React.Component {

  state = {
    error: null,
    loading: true,
  }

  componentDidMount() {
    this.load();
  }

  async load() {
    const { session, me } = this.context;
    if (session.token) {
      try {
        await me.fetch();
        this.setState({
          loading: false
        });
      } catch(error) {
        this.setState({
          error,
          loading: false,
        });
      }
    }
  }

  render() {
    const { error, loading } = this.state;
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
              <a href="/logout">Logout</a>
            </React.Fragment>
          )}
          {loading && <PageLoader />}
        </PageCenter>
      );
    }
    return this.props.children;
  }
}
