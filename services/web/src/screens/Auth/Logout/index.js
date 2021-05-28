import React from 'react';
import { withSession } from 'stores';
import { request } from 'utils/api';

@withSession
export default class Logout extends React.Component {
  async componentDidMount() {
    request({
      method: 'POST',
      path: '/1/auth/logout',
    });
    await this.context.setToken(null);
    document.location = '/';
  }

  render() {
    return <div />;
  }
}
