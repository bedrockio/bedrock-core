import React from 'react';
import { usePage } from 'stores/page';
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

  const tabs = [
    { title: 'Overview', href: `/users/${user.id}` },
    { title: 'Audit Log', href: `/users/${user.id}/audit-log` },
  ];

  return (
    <React.Fragment>
      <PageHeader
        title={user.name}
        breadcrumbItems={items}
        rightSection={<Actions user={user} reload={reload} />}
        tabs={tabs}
      />
    </React.Fragment>
  );
};
