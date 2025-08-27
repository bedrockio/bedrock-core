import { Link, useNavigate } from '@bedrockio/router';
import { Button, Stack } from '@mantine/core';

import PageHeader from 'components/PageHeader';

import Form from './Form';

export default function NewShop() {
  const navigate = useNavigate();

  return (
    <Stack gap="md">
      <PageHeader
        title="New Application"
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Applications', href: '/Applications' },
          { title: 'New Application' },
        ]}
        rightSection={
          <Button component={Link} to="/applications" variant="default">
            Back
          </Button>
        }
      />
      <Form
        onSave={() => {
          navigate(`/applications`);
        }}
      />
    </Stack>
  );
}
