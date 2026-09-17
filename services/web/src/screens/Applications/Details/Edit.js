import { useNavigate } from '@bedrockio/router';

import { usePage } from 'stores/page';

import CloseButton from 'components/CloseButton';
import PageHeader from 'components/PageHeader';

import Form from '../Form';

export default function EditApplication() {
  const { application, reload } = usePage();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={`Edit ${application.name}`}
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Applications', href: '/applications' },
          { title: application.name },
        ]}
        rightSection={<CloseButton to="/applications" />}
      />
      <Form
        application={application}
        onSave={() => {
          reload();
          navigate(`/applications`);
        }}
      />
    </div>
  );
}
