import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Button } from 'semantic';
import { NavLink } from 'react-router-dom';
import { Breadcrumbs, Layout } from 'components';

import EditOrganization from 'modals/EditOrganization';
import DetailsContext from './Context';
import Actions from '../Actions';

export default () => {
  const { item, reload } = useContext(DetailsContext);

  return (
    <React.Fragment>
      <Breadcrumbs
        link={<Link to="/organizations">Organizations</Link>}
        active={item.name}></Breadcrumbs>
      <Layout horizontal center spread>
        <h1>{item.name} Organization</h1>
        <Layout.Group>
          <Actions item={item} reload={reload} />
          <EditOrganization
            organization={item}
            onSave={reload}
            trigger={<Button primary icon="setting" content="Settings" />}
          />
        </Layout.Group>
      </Layout>
      <Menu pointing secondary>
        <Menu.Item
          name="Overview"
          to={`/organizations/${item.id}`}
          as={NavLink}
          exact
        />
      </Menu>
    </React.Fragment>
  );
};
