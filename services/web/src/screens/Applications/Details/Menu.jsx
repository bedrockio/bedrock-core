import React from 'react';
import { Menu, Button } from '/semantic';
import { NavLink, Link } from 'react-router-dom';
import { Breadcrumbs, Layout } from '/components';

import EditApplication from '/modals/EditApplication';

export default ({ application, onSave }) => {
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
            onSave={onSave}
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
