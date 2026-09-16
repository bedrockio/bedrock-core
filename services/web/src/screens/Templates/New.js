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
          { title: 'Templates', href: '/templates' },
          { title: 'New Template' },
        ]}
        rightSection={<CloseButton to="/templates" />}
      />
      <Form
        onSuccess={(template) => {
          navigate(`/templates/${template.id}`);
        }}
      />
    </div>
  );
}
