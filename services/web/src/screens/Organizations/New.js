import { Link, useNavigate } from '@bedrockio/router';
import { Button, Stack } from '@mantine/core';

import PageHeader from 'components/PageHeader';

import Form from './Form';

export default function NewOrganization() {
  const navigate = useNavigate();

  return (
    <Stack>
      <PageHeader
        title="New Organization"
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Organizations', href: '/organizations' },
          { title: 'Organization Shop' },
        ]}
        rightSection={
          <Button component={Link} to="/organizations" variant="default">
            Back
          </Button>
        }
      />
      <Form
        onSave={() => {
          navigate(`/organizations`);
        }}
      />
    </Stack>
  );
}
