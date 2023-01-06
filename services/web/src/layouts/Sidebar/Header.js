import React from 'react';
import PropTypes from 'prop-types';

import bem from 'helpers/bem';

@bem
export default class SidebarLayoutHeader extends React.Component {
  render() {
    const Element = this.props.as;
    return (
      <Element className={this.getBlockClass()}>{this.props.children}</Element>
    );
  }
}

SidebarLayoutHeader.propTypes = {
  as: PropTypes.elementType,
};

SidebarLayoutHeader.defaultProps = {
  as: 'div',
};
