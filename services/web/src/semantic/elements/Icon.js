// This component is a rewrite of Icon in semantic-ui-react using SVG
// sprites. In addition to looking crisper and not suffering accessibility
// and rendering issues, SVG sprites can also be more easily bundled to
// create custom icon sets.
//
// Default set is the latest FontAwesome build. Check the docs for
// available icons: https://fontawesome.com/icons
//
// All other props are identical to the semantic component.

import React from 'react';
import PropTypes from 'prop-types';
import { Icon as SemanticIcon } from 'semantic-ui-react';
import IconGroup from './IconGroup';
import { omit } from 'lodash';

// Note Jest is too convoluted to be able to
// load this file from modules. This can move to src
// when esm support lands.
import { createShorthandFactory } from 'semantic-ui-react/dist/commonjs/lib/factories';

// Maps internal semantic name references to new icon names.
const INTERNAL_MAP = {
  close: 'times',
  delete: 'times',
  setting: 'cog',
  settings: 'cogs',
  dropdown: 'caret-down',
  mail: 'envelope',
};

export default class Icon extends React.Component {
  static Group = IconGroup;

  static sets = {};

  static useSet(url, name = 'basic') {
    this.sets[name] = url;
  }

  getClassName() {
    const classes = ['icon'];
    const { className, ...rest } = this.props;
    if (className) {
      classes.push(className);
    }
    for (let [key, val] of Object.entries(rest)) {
      if (val === true) {
        classes.push(key);
      } else if (typeof val === 'string') {
        if (!['name', 'size', 'color'].includes(key)) {
          classes.push(key);
        }
        classes.push(val);
      }
    }
    return classes.join(' ');
  }

  resolveIcon() {
    const { name } = this.props;
    return {
      name: INTERNAL_MAP[name] || name,
      url: this.resolveSet(),
    };
  }

  resolveSet() {
    if (this.props.outline) {
      return Icon.sets.outline;
    } else if (this.props.custom) {
      return Icon.sets.custom;
    } else {
      return Icon.sets.basic;
    }
  }

  render() {
    const props = omit(this.props, Object.keys(Icon.propTypes));
    const { url, name } = this.resolveIcon();
    return (
      <svg {...props} className={this.getClassName()}>
        <use xlinkHref={`${url}#${name}`}></use>
      </svg>
    );
  }
}

Icon.propTypes = {
  bordered: PropTypes.bool,
  circular: PropTypes.bool,
  color: PropTypes.oneOf([
    'red',
    'orange',
    'yellow',
    'olive',
    'green',
    'teal',
    'blue',
    'violet',
    'purple',
    'pink',
    'brown',
    'grey',
    'black',
  ]),
  corner: PropTypes.oneOf([
    'top left',
    'top right',
    'bottom left',
    'bottom right',
  ]),
  disabled: PropTypes.bool,
  fitted: PropTypes.bool,
  flipped: PropTypes.oneOf(['horizontally', 'vertically']),
  height: PropTypes.number,
  inverted: PropTypes.bool,
  link: PropTypes.bool,
  loading: PropTypes.bool,
  name: PropTypes.string.isRequired,
  rotated: PropTypes.oneOf(['clockwise', 'counterclockwise']),
  size: PropTypes.oneOf([
    'mini',
    'tiny',
    'small',
    'large',
    'big',
    'huge',
    'massive',
  ]),
  width: PropTypes.number,
  outline: PropTypes.bool,
  custom: PropTypes.bool,
};

Icon.defaultProps = {
  bordered: false,
  circular: false,
  disabled: false,
  fitted: false,
  link: false,
  loading: false,
  outline: false,
  custom: false,
};

SemanticIcon.create = createShorthandFactory(Icon, (name) => {
  return { name };
});
