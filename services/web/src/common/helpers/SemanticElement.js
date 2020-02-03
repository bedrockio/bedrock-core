import React from 'react';
import PropTypes from 'prop-types';

export default class SemanticElement extends React.Component {

  getProps() {
    const { className, ...props } = this.props;
    const classes = className ? [className] : [];
    classes.push('ui');
    classes.push(this.constructor.className);
    Object.keys(props)
      .forEach(name => {
        if (name !== 'as') {
          const value = props[name];
          const valType = typeof value;
          if (this.handleCustomProps(props, name, value, classes)) {
            return;
          } else if (valType === 'string') {
            classes.push(name);
            classes.push(value);
            delete props[name];
          } else if (valType === 'boolean') {
            if (!!value) {
              classes.push(name);
            }
            delete props[name];
          }
        }
      });
    props.className = classes.join(' ');
    return props;
  }

  handleCustomProps() {
    return false;
  }

  render() {
    const { as: Component, forwardRef, ...props } = this.getProps();
    return (
      <Component ref={forwardRef} {...props}>
        {this.props.children}
      </Component>
    );
  }

}
