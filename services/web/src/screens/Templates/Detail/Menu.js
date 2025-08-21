import React from 'react';
import { Menu, Button } from 'semantic';
import { NavLink, Link } from '@bedrockio/router';

import { usePage } from 'stores/page';

import Breadcrumbs from 'components/Breadcrumbs';
import Layout from 'components/Layout';
import EditTemplate from 'modals/EditTemplate';

import Actions from '../Actions';

export default () => {
  const { template, reload } = usePage();

  return (
    <React.Fragment>
      <Breadcrumbs
        link={<Link to="/templates">Templates</Link>}
        active={template.name}></Breadcrumbs>
      <Layout horizontal center spread>
        <h1>{template.name}</h1>
        <Layout.Group>
          <Actions template={template} reload={reload} />
          <EditTemplate
            template={template}
            onSave={reload}
            trigger={<Button primary icon="gear" content="Settings" />}
          />
        </Layout.Group>
      </Layout>
      <Menu pointing secondary>
        <Menu.Item
          name="Overview"
          to={`/templates/${template.id}`}
          as={NavLink}
          exact
        />
        <Menu.Item
          name="Edit"
          to={`/templates/${template.id}/edit`}
          as={NavLink}
          exact
        />
        {template.channels.includes('email') && (
          <Menu.Item
            name="Preview"
            to={`/templates/${template.id}/preview`}
            as={NavLink}
            exact
          />
        )}
      </Menu>
    </React.Fragment>
  );
};
