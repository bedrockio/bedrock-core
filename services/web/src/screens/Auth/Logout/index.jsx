import React from 'react';
import { withSession } from '/stores';

class Logout extends React.Component {
  async componentDidMount() {
    await this.context.logout();
  }

  render() {
    return <div />;
  }
}

export default withSession(Logout);
