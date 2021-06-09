import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Button } from 'semantic';
import { NavLink } from 'react-router-dom';
import { Breadcrumbs, Layout } from 'components';

import EditOrganization from 'modals/EditOrganization';

export default ({ organization, onSave }) => {
  return (
    <React.Fragment>
      <Breadcrumbs
        link={<Link to="/organizations">Organizations</Link>}
        active={organization.name}>
      </Breadcrumbs>
      <Layout horizontal center spread>
        <h1>{organization.name} Organization</h1>
        <Layout.Group>
        <EditOrganization
          organization={organization}
          onSave={onSave}
          trigger={<Button primary icon="setting" content="Settings" />}
        />
          </Layout.Group>
      </Layout>
      <Menu pointing secondary>
        <Menu.Item name="Overview" to={`/organizations/${organization.id}`} as={NavLink} exact />

      </Menu>
    </React.Fragment>
  );
};
