import React from 'react';
import { withSession } from 'stores';

@withSession
export default class Logout extends React.Component {
  async componentDidMount() {
    this.props.history.push(await this.context.logout());
  }

  render() {
    return <div />;
  }
}
