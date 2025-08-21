import { Link, useNavigate } from '@bedrockio/router';
import { Button, Stack } from '@mantine/core';

import { usePage } from 'stores/page';

import PageHeader from 'components/PageHeader';

import Form from '../Form';

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
