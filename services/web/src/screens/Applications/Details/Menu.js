import { Pencil } from 'lucide-react';

import { usePage } from 'stores/page';

import PageHeader from 'components/PageHeader';

import Actions from '../Actions';

export default function ApplicationMenu() {
  const { application, reload } = usePage();
  return (
    <PageHeader
      title="Application"
      breadcrumbItems={[
        { title: 'Home', href: '/' },
        { title: 'Organization Settings', href: '/organization' },
        { title: 'Applications', href: '/organization/applications' },
        { title: application.name },
      ]}
      description="Manage your applications"
      rightSection={<Actions application={application} reload={reload} />}
      tabs={[
        {
          icon: <Pencil />,
          title: 'Edit',
          href: `/organization/applications/${application.id}/edit`,
        },
      ]}
    />
  );
}
