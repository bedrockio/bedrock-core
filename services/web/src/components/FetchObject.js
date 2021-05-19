import React from 'react';
import { request } from 'utils/api';
import { Message } from 'semantic';

export default class FetchObject extends React.Component {
  state = {
    data: null,
    loading: true,
    error: null,
  };

  componentDidMount() {
    this.fetch(this.props);
  }

  fetch() {
    const { endpoint, id } = this.props;
    request({
      method: 'GET',
      path: `/1/${endpoint}/${id}`,
    })
      .then(({ data }) => {
        this.setState({ data, error: null, loading: false });
      })
      .catch((error) => {
        this.setState({ error, loading: false });
      });
  }

  render() {
    const { loading, error, data } = this.state;
    if (loading) return <p>loading</p>;
    if (error) return <Message error content={error.message} />;
    return this.props.children(data);
  }
}
