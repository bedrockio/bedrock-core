import React from 'react';
import { kebabCase, defer } from 'lodash';

export default class Component extends React.Component {

  constructor(props) {
    super(props);
    this.name = kebabCase(this.constructor.name);
  }

  getProps(passProps) {
    const props = passProps ? this.passProps() : {};
    return {
      ...props,
      className: this.getComponentClass()
    };
  }

  passProps() {
    const { ...props } = this.props;
    // Remove known props
    if (this.constructor.propTypes) {
      Object.keys(this.constructor.propTypes)
        .forEach(key => delete props[key]);
    }
    return props;
  }

  // Class Names

  getComponentClass() {
    return this.getClasses(
      this.name, this.getModifiers(),
      this.props.className
    )
    .concat(
      this.getExtraClasses()
    )
    .join(' ');
  }

  getElementClass(name, ...modifiers) {
    return this.getClasses(`${this.name}__${name}`, modifiers).join(' ');
  }

  getModifierClass(modifier) {
    return `${this.name}--${modifier}`;
  }

  getModifiers() {
    return [];
  }

  getExtraClasses() {
    return [];
  }

  // Route Events

  setupRouteEvents() {
    this.detachHistory = this.props.history.listen((location, type) => {
      if (this.hashChanged(location)) {
        // Do not fire route changes for hash updates
        return;
      }
      // Defer and check to see that the component has
      // not unmounted before firing the route change event.
      defer(() => {
        if (this.detachHistory) {
          this.fireRouteChange(type);
        }
      });
    });
    this.fireRouteChange('INIT');
  }

  destroyRouteEvents() {
    if (this.detachHistory) {
      this.detachHistory();
      this.detachHistory = null;
    }
  }

  fireRouteChange(type) {
    // TODO: this is stupid... fix it
    if (this.routeDidUpdate) {
      this.routeDidUpdate(type);
    }
    if (this._routeDidUpdate) {
      this._routeDidUpdate(type);
    }
  }

  // Private

  getClasses(name, modifiers, extra) {
    const classes = [name, ...modifiers.filter(m => m).map(m => `${name}--${m}`)];
    if (extra) {
      classes.push(extra);
    }
    return classes;
  }

  hashChanged(newLocation) {
    const { location } = this.props;
    return location.pathname === newLocation.pathname
        && location.hash !== newLocation.hash;
  }

}
