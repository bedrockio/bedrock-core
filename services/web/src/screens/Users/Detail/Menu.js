import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Button } from 'semantic';
import { NavLink } from 'react-router-dom';
import { Breadcrumbs } from 'components';

import EditUser from 'modals/EditUser';
import { Layout } from '../../../components';

export default ({ user, match, onSave }) => {
  const { id } = match.params;
  return (
    <React.Fragment>
      <Breadcrumbs link={<Link to="/users">Users</Link>} active={user?.name || 'Loading...'} />
      <div style={{ display:'block', height:'15px'}} />
      <Layout horizontal center spread>
      <h1 style={{ margin:'0', textTransform: 'capitalize' }}>{user?.name || 'Loading'} User</h1>
        <Layout.Group>
        <EditUser
          user={user}
          onSave={onSave}
          trigger={<Button primary icon="setting" content="Settings" />}
        />
        </Layout.Group>
      </Layout>
      
      <Menu pointing secondary>
        <Menu.Item name="Overview" to={`/users/${id}`} as={NavLink} exact />
      </Menu>
      
    </React.Fragment>
  );
};
