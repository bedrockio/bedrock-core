import React from 'react';
import './mobile.less';

export default class Mobile extends React.Component {
  render() {
    return <div className="mobile">{this.props.children}</div>;
  }
}
