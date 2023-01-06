import React from 'react';
import PropTypes from 'prop-types';

import bem from 'helpers/bem';

@bem
export default class SidebarLayoutDivider extends React.Component {
  render() {
    const { as: Element, ...rest } = this.props;
    return <Element className={this.getBlockClass()} {...rest} />;
  }
}

SidebarLayoutDivider.propTypes = {
  as: PropTypes.elementType,
};

SidebarLayoutDivider.defaultProps = {
  as: 'div',
};
