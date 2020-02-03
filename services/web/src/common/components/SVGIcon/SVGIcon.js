import React from 'react';
import PropTypes from 'prop-types';
import { SemanticElement } from 'common/helpers';
import Icons from './Icons';
import { COLORS, SIZES } from './const';

import './svg-icon.less';

export default class SVGIcon extends SemanticElement {

  static className = 'svg-icon';

  static Group = Icons

  static setBaseUrl(url) {
    this.baseUrl = url;
  }

  static getBaseUrl() {
    return this.baseUrl;
  }

  render() {
    return (
      <svg {...this.getProps()}>
        <use xlinkHref={ `${SVGIcon.getBaseUrl()}#${this.props.name}`}></use>
      </svg>
    );
  }

  handleCustomProps(props, name) {
    if (name === 'width'
     || name === 'height'
     || name === 'name') {
      return true;
    }
    return false;
  }

}

SVGIcon.propTypes = {

  /** Name of the icon. */
  name: PropTypes.string.isRequired,

  /** Formatted to appear bordered. */
  bordered: PropTypes.bool,

  /** Icon can formatted to appear circular. */
  circular: PropTypes.bool,

  /** Additional classes. */
  className: PropTypes.string,

  /** Color of the icon. */
  color: PropTypes.oneOf(COLORS),

  /** Icons can display a smaller corner icon. */
  corner: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.oneOf(['top left', 'top right', 'bottom left', 'bottom right']),
  ]),

  /** Show that the icon is inactive. */
  disabled: PropTypes.bool,

  /** Fitted, without space to left or right of Icon. */
  fitted: PropTypes.bool,

  /** Icon can flipped. */
  flipped: PropTypes.oneOf(['horizontally', 'vertically']),

  /** Formatted to have its colors inverted for contrast. */
  inverted: PropTypes.bool,

  /** Icon can be formatted as a link. */
  link: PropTypes.bool,

  /** Icon can be used as a simple loader. */
  loading: PropTypes.bool,

  /** Icon can rotated. */
  rotated: PropTypes.oneOf(['clockwise', 'counterclockwise']),

  /** Size of the icon. */
  size: PropTypes.oneOf(SIZES),

  /** Icon can have an aria label. */
  'aria-hidden': PropTypes.string,

  /** Icon can have an aria label. */
  'aria-label': PropTypes.string,

  width: PropTypes.number,
  height: PropTypes.number,
  clickable: PropTypes.bool,

};
