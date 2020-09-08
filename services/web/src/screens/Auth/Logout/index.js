import React from 'react';
import { withSession } from 'stores';

@withSession
export default class Logout extends React.Component {
  async componentDidMount() {
    await this.context.setToken(null);
    document.location = '/';
  }

  render() {
    return <div />;
  }
}
