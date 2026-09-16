import { useNavigate } from '@bedrockio/router';

import CloseButton from 'components/CloseButton';
import PageHeader from 'components/PageHeader';

import Form from './Form';

export default function NewOrganization() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="New Organization"
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Organizations', href: '/organizations' },
          { title: 'New Organization' },
        ]}
        rightSection={<CloseButton to="/organizations" />}
      />
      <Form
        onSuccess={(organization) => {
          navigate(`/organizations/${organization.id}`);
        }}
      />
    </div>
  );
}
