import React from 'react';
import PropTypes from 'prop-types';
import { SemanticElement } from 'common/helpers';
import { SIZES } from './const';

export default class Icons extends SemanticElement {

  static className = 'icons';

  render() {
    return (
      <span {...this.getProps()}>
        {this.props.children}
      </span>
    );
  }

}

Icons.propTypes = {
  size: PropTypes.oneOf(SIZES),
};
