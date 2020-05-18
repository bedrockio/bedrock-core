import React from 'react';
import inject from 'stores/inject';

@inject('session')
export default class Logout extends React.Component {

  componentDidMount() {
    this.context.session.setToken(null);
    this.props.history.replace('/');
  }

  render() {
    return <div />;
  }
}
