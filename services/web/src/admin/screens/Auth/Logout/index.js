import React from 'react';
import { inject } from 'mobx-react';

@inject('appSession', 'routing')
export default class Logout extends React.Component {
  componentDidMount() {
    this.props.appSession.reset();
    window.location.href = '/admin/';
  }
  render() {
    return <div />;
  }
}
