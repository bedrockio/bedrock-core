import React from 'react';
import { Menu } from 'semantic';
import { NavLink } from 'react-router-dom';

import Breadcrumbs from 'components/Breadcrumbs';

export default () => {
  return (
    <React.Fragment>
      <Breadcrumbs active="Settings"></Breadcrumbs>
      <Menu pointing secondary>
        <Menu.Item name="Profile" to="/settings/profile" as={NavLink} exact />
        <Menu.Item
          name="Appearance"
          to="/settings/appearance"
          as={NavLink}
          exact
        />
        <Menu.Item name="Security" to="/settings/security" as={NavLink} exact />
        <Menu.Item name="Sessions" to="/settings/sessions" as={NavLink} exact />
      </Menu>
    </React.Fragment>
  );
};
