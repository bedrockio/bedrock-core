import React from 'react';
import { Link } from '@bedrockio/router';

import { usePage } from 'stores/page';

import { Button } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';

import PageHeader from 'components/PageHeader.js';
import Actions from '../Actions';

export default () => {
  const { user, reload } = usePage();

  const items = [
    {
      title: 'Home',
      href: '/',
    },
    { title: 'Users', href: '/users' },
    { title: user.name },
  ];

  const tabs = [{ title: 'Overview', href: `/users/${user.id}` }];

  return (
    <React.Fragment>
      <PageHeader
        title={user.name}
        breadcrumbItems={items}
        rightSection={
          <>
            <Actions user={user} reload={reload} />
            <Button
              component={Link}
              to={`/users/${user.id}/edit`}
              rightSection={<IconPencil size={14} />}>
              Edit
            </Button>
          </>
        }
        tabs={tabs}
      />
    </React.Fragment>
  );
};
