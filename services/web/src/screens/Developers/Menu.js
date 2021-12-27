import React from 'react';
import { Menu } from 'semantic';
import { NavLink } from 'react-router-dom';
import { Breadcrumbs } from 'components';

export default () => {
  return (
    <React.Fragment>
      <Breadcrumbs active="Developer" />
      <Menu pointing secondary>
        <Menu.Item name="Applications" to="/developers" as={NavLink} exact />
        <Menu.Item name="Logs" to="/developers/logs" as={NavLink} exact />
      </Menu>
    </React.Fragment>
  );
};
