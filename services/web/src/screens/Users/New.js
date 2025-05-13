import PageHeader from 'components/PageHeader';
import Form from './Form';
import { Stack, Button } from '@mantine/core';
import { useNavigate } from '@bedrockio/router';
import { Link } from '@bedrockio/router';
import { IconArrowBack } from '@tabler/icons-react';

export default function NewUser() {
  const navigate = useNavigate();

  return (
    <Stack gap="md">
      <PageHeader
        title="New User"
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Users', href: '/users' },
          { title: 'New User' },
        ]}
        rightSection={
          <Button
            component={Link}
            to="/users"
            variant="default"
            rightSection={<IconArrowBack size={14} />}>
            Back
          </Button>
        }
      />

      <Form
        onSuccess={(user) => {
          navigate(`/users/${user.id}`);
        }}
      />
    </Stack>
  );
}
