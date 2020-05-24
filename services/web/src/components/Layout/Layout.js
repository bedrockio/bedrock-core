import React from 'react';
import PropTypes from 'prop-types';
import { omit } from 'lodash';
import Group from './Group';

import './layout.less';

export default class Layout extends React.Component {

  static Group = Group;

  getClassNames() {
    const classNames = ['layout'];
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

Layout.propTypes = {
  wrap: PropTypes.bool,
  center: PropTypes.bool,
  stretch: PropTypes.bool,
  vertical: PropTypes.bool,
  horizontal: PropTypes.bool,
  stackable: PropTypes.bool,
  spread: PropTypes.bool,
  padded: PropTypes.bool,
  baseline: PropTypes.bool,
  reversed: PropTypes.bool,
  bottom: PropTypes.bool,
  right: PropTypes.bool,
  extra: PropTypes.bool,
  top: PropTypes.bool,
};
