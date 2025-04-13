import React from 'react';
import { Menu, Button } from 'semantic';
import { NavLink, Link } from '@bedrockio/router';

import { usePage } from 'stores/page';

import Layout from 'components/Layout';
import Breadcrumbs from 'components/Breadcrumbs';
import EditApplication from 'modals/EditApplication';
import PageHeader from 'components/PageHeader';

import { IconPencil } from '@tabler/icons-react';

export default function ApplicationMenu() {
  const { application, reload } = usePage();
  return (
    <>
      <PageHeader
        title="Application"
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Applications', href: '/applications' },
          { title: application.name },
        ]}
        description="Manage your applications"
        rightSection={
          <Button
            component={Link}
            to="/applications/"
            icon="plus"
            primary
            content="Edit"
          />
        }
        tabs={[
          {
            icon: <IconPencil size={12} />,
            title: 'Edit',
            href: `/applications/${application.id}/edit`,
          },
        ]}
      />

      <Menu pointing secondary>
        <Menu.Item
          name="Overview"
          to={`/applications/${application.id}`}
          as={NavLink}
          exact
        />
      </Menu>
    </>
  );
}
