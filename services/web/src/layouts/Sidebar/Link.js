import React from 'react';
import { NavLink } from 'react-router-dom';

import bem from 'helpers/bem';

@bem
export default class SidebarLayoutLink extends React.Component {
  render() {
    return <NavLink className={this.getBlockClass()} {...this.props} />;
  }
}
