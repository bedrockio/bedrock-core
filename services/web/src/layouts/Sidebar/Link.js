import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import bem from 'helpers/bem';

@bem
export default class SidebarLayoutLink extends React.Component {
  render() {
    const { as: Element, ...rest } = this.props;
    return <Element className={this.getBlockClass()} {...rest} />;
  }
}

SidebarLayoutLink.propTypes = {
  as: PropTypes.elementType,
};

SidebarLayoutLink.defaultProps = {
  as: NavLink,
};
