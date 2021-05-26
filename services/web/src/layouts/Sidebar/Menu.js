import React from 'react';
import PropTypes from 'prop-types';
import bem from 'helpers/bem';

@bem
export default class SidebarLayoutMenu extends React.Component {
  getModifiers() {
    const { dark } = this.props;
    const { offscreen, open } = this.context;
    return [
      dark ? 'dark' : null,
      open ? 'open' : null,
      offscreen ? 'offscreen' : null,
    ];
  }

  render() {
    const Element = this.props.as;
    return (
      <Element className={this.getBlockClass()}>{this.props.children}</Element>
    );
  }
}

SidebarLayoutMenu.propTypes = {
  dark: PropTypes.bool,
  as: PropTypes.elementType,
};

SidebarLayoutMenu.defaultProps = {
  as: 'nav',
  dark: false,
};
