import PropTypes from 'prop-types';
import { SemanticElement } from 'common/helpers';
import Group from './Group';

import './layout.less';

export default class Layout extends SemanticElement {

  static className = 'layout';

  static Group = Group;

  static propTypes = {
    as: PropTypes.elementType,
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

  static defaultProps = {
    as: 'div',
  };

}
