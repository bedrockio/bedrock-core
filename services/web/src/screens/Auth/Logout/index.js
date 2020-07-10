import React from 'react';
import { withSession } from 'stores';

@withSession
export default class Logout extends React.Component {

  async componentDidMount() {
    await this.context.setToken(null);
    this.props.history.replace('/');
  }

  render() {
    return <div />;
  }
}
