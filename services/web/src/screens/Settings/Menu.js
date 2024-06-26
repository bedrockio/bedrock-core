import React from 'react';
import { Menu } from 'semantic';
import { NavLink } from 'react-router-dom';

import Breadcrumbs from 'components/Breadcrumbs';

export default () => {
  return (
    <React.Fragment>
      <Breadcrumbs active="Account settings"></Breadcrumbs>
      <Menu pointing secondary>
        <Menu.Item name="Account" to="/settings/account" as={NavLink} exact />
        <Menu.Item
          name="Appearance"
          to="/settings/appearance"
          as={NavLink}
          exact
        />
        <Menu.Item name="Login" to="/settings/login" as={NavLink} exact />
        <Menu.Item name="Sessions" to="/settings/sessions" as={NavLink} exact />
      </Menu>
    </React.Fragment>
  );
};
