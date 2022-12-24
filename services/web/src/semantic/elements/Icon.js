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
import { omit } from 'lodash';

// Note Jest is too convoluted to be able to
// load this file from modules. This can move to src
// when esm support lands.
import { createShorthandFactory } from 'semantic-ui-react/dist/commonjs/lib/factories';

import IconGroup from './IconGroup';

// Maps internal semantic name references to new icon names.
const INTERNAL_MAP = {
  close: 'xmark',
  delete: 'xmark',
  setting: 'gear',
  settings: 'gears',
  sync: 'rotate',
  search: 'magnifying-glass',
  edit: 'pen-to-square',
  dropdown: (props) => {
    // Semantic stupidly overrides icons based on className
    // instead of passing the correct "name" so conditionally
    // handle here.
    if (props.className.split(' ').includes('clear')) {
      return 'xmark';
    }
    return 'caret-down';
  },
  mail: 'envelope',
  'message-bubble': 'message',
  'log-out': 'right-from-bracket',
  'table-full': 'table',
  'message-bubble regular': 'message regular',
};
const CLASS_PROPS = ['name', 'size', 'color', 'corner', 'flipped', 'rotated'];

export default class Icon extends React.Component {
  static Group = IconGroup;

  static sets = {};

  static useSet(url, name = 'default') {
    this.sets[name] = url;
  }

  getClassName() {
    const classes = ['ui icon'];
    const { className, ...rest } = this.props;
    if (className) {
      classes.push(className);
    }
    for (let [key, val] of Object.entries(rest)) {
      if (val === true) {
        classes.push(key);
      } else if (typeof val === 'string') {
        if (CLASS_PROPS.includes(key)) {
          classes.push(val);
        }
      }
    }
    return classes.join(' ');
  }

  resolveIcon() {
    let name = this.resolveName();
    let set = 'default';
    name = name
      .split(' ')
      .filter((token) => {
        if (Icon.sets[token]) {
          set = token;
          return false;
        }
        return true;
      })
      .join(' ');
    return {
      name,
      url: Icon.sets[set],
    };
  }

  resolveName() {
    let { name } = this.props;
    let _name = name ? name.trim() : "";
    let iconName = INTERNAL_MAP[_name] || _name;
    if (typeof iconName === 'function') {
      return iconName(this.props);
    }
    return iconName;
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
  inverted: PropTypes.bool,
  link: PropTypes.bool,
  loading: PropTypes.bool,
  name: PropTypes.string.isRequired,
  rotated: PropTypes.oneOf(['clockwise', 'counterclockwise']),
  set: PropTypes.string,
  size: PropTypes.oneOf([
    'mini',
    'tiny',
    'small',
    'large',
    'big',
    'huge',
    'massive',
  ]),
};

Icon.defaultProps = {
  bordered: false,
  circular: false,
  disabled: false,
  fitted: false,
  link: false,
  loading: false,
  set: 'default',
};

SemanticIcon.create = createShorthandFactory(Icon, (name) => {
  return { name };
});
