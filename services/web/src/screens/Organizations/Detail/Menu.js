import { usePage } from 'stores/page';

import PageHeader from 'components/PageHeader';

import Actions from '../Actions';

export default function OrganizationMenu({ displayMode }) {
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
      tabs={
        displayMode !== 'edit' && [
          {
            title: 'Overview',
            href: `/organizations/${organization.id}`,
          },
        ]
      }
      rightSection={
        <Actions
          displayMode={displayMode}
          organization={organization}
          reload={reload}
        />
      }
    />
  );
}
