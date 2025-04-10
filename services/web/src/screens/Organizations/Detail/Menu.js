import { usePage } from 'stores/page';

import PageHeader from 'components/PageHeader.js';

import Actions from '../Actions';

import { IconPencil } from '@tabler/icons-react';

export default function OrganizationMenu() {
  const { organization, reload } = usePage();

  const items = [
    {
      title: 'Home',
      href: '/',
    },
    { title: 'Organizations', href: '/organizations' },
    { title: organization.name },
  ];

  return (
    <PageHeader
      title={organization.name}
      breadcrumbItems={items}
      tabs={[
        {
          icon: <IconPencil size={12} />,
          title: 'Edit',
          href: `/organizations/${organization.id}/edit`,
        },
      ]}
      rightSection={<Actions organization={organization} reload={reload} />}
    />
  );
}
