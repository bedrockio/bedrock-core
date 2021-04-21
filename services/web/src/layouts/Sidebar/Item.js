import React from 'react';
import PropTypes from 'prop-types';
import bem from 'helpers/bem';

@bem
export default class SidebarLayoutItem extends React.Component {
  render() {
    const { as: Element, ...rest } = this.props;
    return <Element className={this.getBlockClass()} {...rest} />;
  }
}

SidebarLayoutItem.propTypes = {
  as: PropTypes.elementType,
};

SidebarLayoutItem.defaultProps = {
  as: 'div',
};
