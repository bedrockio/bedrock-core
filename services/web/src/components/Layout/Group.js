import React from 'react';
import PropTypes from 'prop-types';

import './group.less';

export default class Group extends React.Component {
  getProps() {
    const { className, children, ...rest } = this.props;
    const classNames = ['group'];
    if (className) {
      classNames.push(className);
    }
    for (let key of Object.keys(rest)) {
      if (key in Group.propTypes) {
        classNames.push(key);
        delete rest[key];
      }
    }
    return {
      className: classNames.join(' '),
      ...rest,
    };
  }

  render() {
    return <div {...this.getProps()}>{this.props.children}</div>;
  }
}

Group.propTypes = {
  grow: PropTypes.bool,
  flex: PropTypes.bool,
  fixed: PropTypes.bool,
  shrink: PropTypes.bool,
};
