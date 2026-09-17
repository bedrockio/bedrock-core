import { useNavigate } from '@bedrockio/router';

import CloseButton from 'components/CloseButton';
import PageHeader from 'components/PageHeader';

import Form from './Form';

export default function NewTemplate() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="New Template"
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Organization Settings', href: '/organization' },
          { title: 'Templates', href: '/organization/templates' },
          { title: 'New Template' },
        ]}
        rightSection={<CloseButton to="/organization/templates" />}
      />
      <Form
        onSuccess={(template) => {
          navigate(`/organization/templates/${template.id}`);
        }}
      />
    </div>
  );
}
