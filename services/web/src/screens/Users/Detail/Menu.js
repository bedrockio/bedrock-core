import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Dropdown, Button } from 'semantic';
import { NavLink } from 'react-router-dom';
import { Breadcrumbs } from 'components';

import { Layout } from 'components';

import DetailsContext from './Context';
import Actions from '../Actions';
import EditUser from 'modals/EditUser';

export default () => {
  const { item, reload } = useContext(DetailsContext);

  return (
    <React.Fragment>
      <Breadcrumbs link={<Link to="/users">Users</Link>} active={item.name} />
      <Layout horizontal center spread>
        <h1 style={{ textTransform: 'capitalize' }}>{item.name} User</h1>
        <Layout.Group>
          <Dropdown
            button
            basic
            disabled={!item}
            text="More"
            style={{ marginTop: '-5px' }}>
            <Dropdown.Menu direction="left">
              {item && <Actions item={item} reload={reload} />}
            </Dropdown.Menu>
          </Dropdown>
          <EditUser
            user={item}
            trigger={<Button primary content="Edit" icon="edit" />}
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
