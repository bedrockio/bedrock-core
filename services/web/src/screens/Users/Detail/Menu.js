import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Divider, Button } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import { Breadcrumbs } from 'components';

import EditUser from 'modals/EditUser';

export default ({ user, match, onSave }) => {
  const { id } = match.params;
  return (
    <React.Fragment>
      <Breadcrumbs link={<Link to="/users">Users</Link>} active={user?.name || 'Loading...'}>
        <EditUser
          user={user}
          onSave={onSave}
          trigger={
            <Button
              primary
              icon="setting"
              content="Settings"
            />
          }
        />
      </Breadcrumbs>
      <Divider hidden />
      <Menu tabular>
        <Menu.Item name="Overview" to={`/users/${id}`} as={NavLink} exact />
      </Menu>
      <Divider hidden />
    </React.Fragment>
  );
};
