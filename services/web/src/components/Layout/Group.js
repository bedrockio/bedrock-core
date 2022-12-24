import React from 'react';
import PropTypes from 'prop-types';

import { SIZE_TYPE, getSizeStyles } from './utils';

import './group.less';

export default class Group extends React.Component {
  getProps() {
    const { className, children, ...rest } = this.props;
    const classNames = ['layout-group'];
    if (className) {
      classNames.push(className);
    }
    for (let key of Object.keys(rest)) {
      if (key in Group.propTypes) {
        if (typeof rest[key] === 'boolean') {
          classNames.push(key);
        }
        delete rest[key];
      }
    }
    return {
      className: classNames.join(' '),
      ...rest,
    };
  }

  render() {
    return (
      <div {...this.getProps()} style={getSizeStyles(this.props)}>
        {this.props.children}
      </div>
    );
  }
}

Group.propTypes = {
  size: SIZE_TYPE,
  grow: PropTypes.bool,
  flex: PropTypes.bool,
  fixed: PropTypes.bool,
  shrink: PropTypes.bool,
  center: PropTypes.bool,
  overflow: PropTypes.bool,
};
