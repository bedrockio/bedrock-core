import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Button } from 'semantic';

import { usePage } from 'contexts/page';

import Breadcrumbs from 'components/Breadcrumbs';
import Layout from 'components/Layout';
import EditOrganization from 'modals/EditOrganization';

import Actions from '../Actions';

export default () => {
  const { organization, reload } = usePage();

  return (
    <React.Fragment>
      <Breadcrumbs
        link={<Link to="/organizations">Organizations</Link>}
        active={organization.name}></Breadcrumbs>
      <Layout horizontal center spread>
        <h1>{organization.name}</h1>
        <Layout.Group>
          <Actions organization={organization} reload={reload} />
          <EditOrganization
            organization={organization}
            onSave={reload}
            trigger={<Button primary icon="gear" content="Settings" />}
          />
        </Layout.Group>
      </Layout>
      <Menu pointing secondary>
        <Menu.Item
          name="Overview"
          to={`/organizations/${organization.id}`}
          as={NavLink}
          exact
        />
      </Menu>
    </React.Fragment>
  );
};
