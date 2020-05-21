import React from 'react';
import PropTypes from 'prop-types';
import { omit } from 'lodash';

import './group.less';

export default class Group extends React.Component {

  getClassNames() {
    const classNames = ['group'];
    const props = omit(this.props, 'children');
    for (let className of Object.keys(props)) {
      classNames.push(className);
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
