import React from 'react';
import { Menu, Button } from 'semantic';
import { NavLink, Link } from '@bedrockio/router';

import { usePage } from 'stores/page';

import Layout from 'components/Layout';
import Breadcrumbs from 'components/Breadcrumbs';
import EditApplication from 'modals/EditApplication';

export default () => {
  const { application, reload } = usePage();
  return (
    <React.Fragment>
      <Breadcrumbs
        link={<Link to="/applications">Applications</Link>}
        active={application.name}></Breadcrumbs>
      <Layout horizontal center spread>
        <h1>{application.name}</h1>
        <Layout.Group>
          <EditApplication
            application={application}
            onSave={reload}
            trigger={<Button primary icon="setting" content="Settings" />}
          />
        </Layout.Group>
      </Layout>
      <Menu pointing secondary>
        <Menu.Item
          name="Overview"
          to={`/applications/${application.id}`}
          as={NavLink}
          exact
        />
        <Menu.Item
          name="Logs"
          to={`/applications/${application.id}/logs`}
          as={NavLink}
          exact
        />
      </Menu>
    </React.Fragment>
  );
};
