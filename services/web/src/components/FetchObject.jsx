import React from 'react';
import { request } from '/utils/api';

import ErrorMessage from './ErrorMessage';

export default class FetchObject extends React.Component {
  state = {
    data: null,
    loading: true,
    error: null,
  };

  componentDidMount() {
    this.fetch(this.props);
  }

  async fetch() {
    const { endpoint, id } = this.props;
    try {
      const { data } = await request({
        method: 'GET',
        path: `/1/${endpoint}/${id}`,
      });
      this.setState({ data, error: null, loading: false });
    } catch (error) {
      this.setState({ error, loading: false });
    }
  }

  render() {
    const { loading, error, data } = this.state;
    if (loading) {
      return <p>loading</p>;
    }
    if (error) {
      return <ErrorMessage error={error} />;
    }
    return this.props.children(data);
  }
}
