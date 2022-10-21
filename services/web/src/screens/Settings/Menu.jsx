import React from 'react';
import { Menu } from '/semantic';
import { NavLink } from 'react-router-dom';
import { Breadcrumbs } from '/components';

export default () => {
  return (
    <React.Fragment>
      <Breadcrumbs active="Account settings"></Breadcrumbs>
      <Menu pointing secondary>
        <Menu.Item name="Account" to="/settings/account" as={NavLink} exact />
        <Menu.Item name="Security" to="/settings/security" as={NavLink} exact />
      </Menu>
    </React.Fragment>
  );
};
