import Form from '../Form.js';

import { usePage } from 'stores/page';

import { Stack, Button } from '@mantine/core';
import { useNavigate } from '@bedrockio/router';
import PageHeader from 'components/PageHeader.js';

import { Link } from '@bedrockio/router';
import { IconEye } from '@tabler/icons-react';

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
          <Button
            leftSection={<IconEye size={14} />}
            component={Link}
            to={`/applications`}
            variant="default">
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
