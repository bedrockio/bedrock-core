import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Button } from 'semantic';

import { usePage } from 'stores/page';

import { Breadcrumbs, Layout } from 'components';
import EditUser from 'modals/EditUser';

import Actions from '../Actions';

export default () => {
  const { user, reload } = usePage();

  return (
    <React.Fragment>
      <Breadcrumbs link={<Link to="/users">Users</Link>} active={user.name} />
      <Layout horizontal center spread>
        <h1 style={{ textTransform: 'capitalize' }}>{user.name} User</h1>
        <Layout.Group>
          <Actions user={user} reload={reload} />
          <EditUser
            user={user}
            trigger={<Button primary content="Edit" icon="pen-to-square" />}
            onSave={reload}
          />
        </Layout.Group>
      </Layout>
      <Menu pointing secondary>
        <Menu.Item
          name="Overview"
          to={`/users/${user.id}`}
          as={NavLink}
          exact
        />
      </Menu>
    </React.Fragment>
  );
};
