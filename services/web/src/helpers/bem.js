// Helper that provides methods to easily create
// BEM style block/element/modifier classes.

import React from 'react';
import { kebabCase } from 'lodash';

import { wrapComponent, getWrappedComponent } from 'utils/hoc';

export default function (Component, prefix = '') {
  // Unwrap wrapped components
  const Wrapped = getWrappedComponent(Component);

  const block = kebabCase(`${prefix}${Wrapped.name}`);

  function getBlockClass(props, modifiers) {
    return getClassNames(block, modifiers, props.className);
  }

  function getElementClass(element, ...modifiers) {
    return getClassNames(`${block}__${element}`, modifiers);
  }

  if (Wrapped.prototype instanceof React.Component) {
    Wrapped.prototype.getBlockClass = function () {
      return getBlockClass(this.props, this.getModifiers?.() || []);
    };
    Wrapped.prototype.getElementClass = getElementClass;
    return Component;
  } else {
    return wrapComponent(Component, (props) => {
      return (
        <Component
          {...props}
          getBlockClass={(...modifiers) => getBlockClass(props, modifiers)}
          getElementClass={getElementClass}
        />
      );
    });
  }
}

export function useClass(block, ...args) {
  let extra;
  let modifiers = [];
  if (args[0] && typeof args[0] === 'object') {
    extra = args[0].className;
    modifiers = args.slice(1);
  } else {
    modifiers = args;
  }
  const className = getClassNames(block, modifiers, extra);
  return {
    className,
    getElementClass(element, ...modifiers) {
      return getClassNames(`${block}__${element}`, modifiers);
    },
  };
}

function getClassNames(base, modifiers, extra) {
  const classes = [
    base,
    ...modifiers.filter((m) => m).map((m) => `${base}--${m}`),
  ];
  if (extra) {
    classes.push(extra);
  }
  return classes.join(' ');
}
