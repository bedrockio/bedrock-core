import React from 'react';

import { SIZE_TYPE, getSizeStyles } from './utils';

import './spacer.less';

export default class Spacer extends React.Component {
  render() {
    return <div className="layout-spacer" style={getSizeStyles(this.props)} />;
  }
}

Spacer.propTypes = {
  size: SIZE_TYPE,
};

Spacer.defaultProps = {
  size: 'm',
};
