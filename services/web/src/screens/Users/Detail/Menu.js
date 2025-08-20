import React from 'react';
import { usePage } from 'stores/page';
import PageHeader from 'components/PageHeader';
import Actions from '../Actions';

export default function UserMenu({ displayMode }) {
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
          <Actions displayMode={displayMode} user={user} reload={reload} />
        }
        tabs={displayMode !== 'edit' && tabs}
      />
    </React.Fragment>
  );
}
