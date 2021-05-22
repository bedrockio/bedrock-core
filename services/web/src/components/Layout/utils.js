import PropTypes from 'prop-types';
import { round } from 'lodash';

export const SIZES = ['xxs', 'xs', 's', 'm', 'l', 'xl'];
export const SIZE_TYPE = PropTypes.oneOfType([
  PropTypes.number,
  PropTypes.string,
]);

// Aligns with vertical Spacer component.
const SPACING = {
  xxs: '8px',
  xs: '16px',
  s: '32px',
  m: '64px',
  l: '128px',
  xl: '256px',
};

export function getSizeStyles(props) {
  const { size } = props;
  if (size) {
    // Webkit has a nasty bug with nested flex layouts such
    // that flex-basis is not accounted for in the parent layout size.
    // The workaround is to change flex-basis to width, however this
    // defeats the purpose of using flexbox for stackable layouts, so
    // instead only use width for horizontal layouts when not stacking.
    // Making use of CSS vars here to avoid issues with importance.
    //
    // https://bugs.chromium.org/p/chromium/issues/detail?id=464210
    const basis = getFlexBasis(size);
    return {
      '--flex-basis': basis,
      width: basis,
    };
  }
}

function getFlexBasis(size) {
  if (typeof size === 'number') {
    size = `${round((size / 12) * 100, 2)}%`;
  } else if (SIZES.includes(size)) {
    size = SPACING[size];
  }
  return size;
}
