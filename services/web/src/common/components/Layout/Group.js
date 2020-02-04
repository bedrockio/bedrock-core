import PropTypes from 'prop-types';
import { SemanticElement } from 'common/helpers';

import './group.less';

export default class Group extends SemanticElement {

  static className = 'group';

  static propTypes = {
    as: PropTypes.elementType,
    grow: PropTypes.bool,
    flex: PropTypes.bool,
    fixed: PropTypes.bool,
  };

  static defaultProps = {
    as: 'div',
  };

}
