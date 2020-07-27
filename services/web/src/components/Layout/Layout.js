import React from 'react';
import PropTypes from 'prop-types';
import { omit } from 'lodash';
import Group from './Group';
import Spacer from './Spacer';

import './layout.less';

export default class Layout extends React.Component {

  static Group = Group;
  static Spacer = Spacer;

  getProps() {
    const { className, ...rest } = this.props;
    return {
      ...omit(rest, Object.keys(Layout.propTypes)),
      className: this.getClassNames(className),
    };
  }

  getClassNames(propClassName) {
    const classNames = ['layout'];
    if (propClassName) {
      classNames.push(propClassName);
    }
    for (let name of Object.keys(Layout.propTypes)) {
      if (name in this.props) {
        classNames.push(name);
      }
    }
    return classNames.join(' ');
  }

  render() {
    return (
      <div {...this.getProps()}>
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
