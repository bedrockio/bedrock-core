import React from 'react';
import inject from 'stores/inject';
import { request } from 'utils/api';
import PageCenter from 'components/PageCenter';
import PageLoader from 'components/PageLoader';
import { Message } from 'semantic-ui-react';

@inject('session')
export default class Boot extends React.Component {

  state = {
    error: null,
    loading: true,
  }

  componentDidMount() {
    this.load();
  }

  async load() {
    const { session } = this.context;
    if (session.token) {
      try {
        const { data } = await request({
          method: 'GET',
          path: '/1/users/me'
        });
        session.setUser(data);
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
