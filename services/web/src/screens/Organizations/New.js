import PageHeader from 'components/PageHeader';

import Form from './Form';
import { Stack, Button } from '@mantine/core';
import { useNavigate } from '@bedrockio/router';
import { Link } from '@bedrockio/router';
import { IconArrowRight } from '@tabler/icons-react';

export default function NewShop() {
  const navigate = useNavigate();

  return (
    <Stack gap="md">
      <PageHeader
        title="New Organization"
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Organizations', href: '/organizations' },
          { title: 'Organization Shop' },
        ]}
        rightSection={
          <Button
            component={Link}
            to="/applications"
            variant="default"
            rightSection={<IconArrowRight size={14} />}>
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
