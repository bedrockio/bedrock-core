import React from 'react';
import { session } from 'stores';

export default class Logout extends React.Component {

  componentDidMount() {
    session.setToken(null);
    this.props.history.replace('/');
  }

  render() {
    return <div />;
  }
}
