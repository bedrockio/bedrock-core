import React, { useContext } from 'react';
import { Link , NavLink } from 'react-router-dom';
import { Menu, Button } from 'semantic';

import { Breadcrumbs , Layout } from 'components';
import EditUser from 'modals/EditUser';

import Actions from '../Actions';

import DetailsContext from './Context';

export default () => {
  const { item, reload } = useContext(DetailsContext);

  return (
    <React.Fragment>
      <Breadcrumbs link={<Link to="/users">Users</Link>} active={item.name} />
      <Layout horizontal center spread>
        <h1 style={{ textTransform: 'capitalize' }}>{item.name} User</h1>
        <Layout.Group>
          <Actions item={item} reload={reload} />
          <EditUser
            user={item}
            trigger={<Button primary content="Edit" icon="pen-to-square" />}
            onSave={reload}
          />
        </Layout.Group>
      </Layout>
      <Menu pointing secondary>
        <Menu.Item
          name="Overview"
          to={`/users/${item.id}`}
          as={NavLink}
          exact
        />
      </Menu>
    </React.Fragment>
  );
};
