import React from 'react';

import { withSession } from 'contexts/session';

@withSession
export default class Logout extends React.Component {
  async componentDidMount() {
    await this.context.logout();
  }

  render() {
    return <div />;
  }
}
