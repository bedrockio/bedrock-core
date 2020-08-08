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
    const classNames = ['ui', 'layout'];
    if (propClassName) {
      classNames.push(propClassName);
    }
    for (let [name, value] of Object.entries(Layout.propTypes)) {
      if (value === PropTypes.bool && name in this.props) {
        classNames.push(name);
      }
    }
    return classNames.join(' ');
  }

  render() {
    const { as: Component } = this.props;
    return (
      <Component {...this.getProps()}>
        {this.props.children}
      </Component>
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
  as: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.elementType,
  ]),
};

Layout.defaultProps = {
  as: 'div',
};
