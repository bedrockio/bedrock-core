import React from 'react';
import { NavLink } from 'react-router-dom';
import bem from '/helpers/bem';

class SidebarLayoutLink extends React.Component {
  render() {
    return <NavLink className={this.getBlockClass()} {...this.props} />;
  }
}

export default bem(SidebarLayoutLink);
