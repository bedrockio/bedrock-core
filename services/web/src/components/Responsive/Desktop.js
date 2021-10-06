import React from 'react';
import './desktop.less';

export default class Desktop extends React.Component {
  render() {
    return <div className="desktop">{this.props.children}</div>;
  }
}
