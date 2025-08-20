import Form from '../Form';

import { usePage } from 'stores/page';

import { Stack, Button } from '@mantine/core';
import { useNavigate } from '@bedrockio/router';
import PageHeader from 'components/PageHeader';

import { Link } from '@bedrockio/router';

export default function EditApplication() {
  const { application, reload } = usePage();
  const navigate = useNavigate();

  return (
    <Stack gap="md">
      <PageHeader
        title={`Edit ${application.name}`}
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Applications', href: '/applications' },
          { title: application.name },
        ]}
        rightSection={
          <Button component={Link} to={`/applications`} variant="default">
            Show
          </Button>
        }
      />
      <Form
        application={application}
        onSave={() => {
          reload();
          navigate(`/applications`);
        }}
      />
    </Stack>
  );
}
