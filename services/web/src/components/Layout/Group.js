import React from 'react';
import PropTypes from 'prop-types';

import './group.less';

export default class Group extends React.Component {

  getClassNames() {
    const { className, children, ...props } = this.props;
    const classNames = ['group'];
    if (className) {
      classNames.push(className);
    }
    for (let key of Object.keys(props)) {
      classNames.push(key);
    }
    return classNames.join(' ');
  }

  render() {
    return (
      <div className={this.getClassNames()}>
        {this.props.children}
      </div>
    );
  }

}

Group.propTypes = {
  grow: PropTypes.bool,
  flex: PropTypes.bool,
  fixed: PropTypes.bool,
  shrink: PropTypes.bool,
};
