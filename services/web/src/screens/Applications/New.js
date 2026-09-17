import { useNavigate } from '@bedrockio/router';

import CloseButton from 'components/CloseButton';
import PageHeader from 'components/PageHeader';

import Form from './Form';

export default function NewApplication() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="New Application"
        rightSection={<CloseButton to="/organization/applications" />}
      />
      <Form
        onSave={() => {
          navigate(`/organization/applications`);
        }}
      />
    </div>
  );
}
