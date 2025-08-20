import { usePage } from 'stores/page';

import PageHeader from 'components/PageHeader';
import Actions from '../Actions';

import { PiPencilSimpleFill } from 'react-icons/pi';

export default function ApplicationMenu() {
  const { application, reload } = usePage();
  return (
    <PageHeader
      title="Application"
      breadcrumbItems={[
        { title: 'Home', href: '/' },
        { title: 'Applications', href: '/applications' },
        { title: application.name },
      ]}
      description="Manage your applications"
      rightSection={<Actions application={application} reload={reload} />}
      tabs={[
        {
          icon: <PiPencilSimpleFill />,
          title: 'Edit',
          href: `/applications/${application.id}/edit`,
        },
      ]}
    />
  );
}
