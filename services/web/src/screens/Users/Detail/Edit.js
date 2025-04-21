import Form from '../Form.js';

import { usePage } from 'stores/page';

import { Stack, Button } from '@mantine/core';
import { useNavigate, Link } from '@bedrockio/router';
import PageHeader from 'components/PageHeader';
import { IconArrowBack } from '@tabler/icons-react';

export default function EditUser() {
  const { user, reload } = usePage();
  const navigate = useNavigate();

  return (
    <Stack gap="md">
      <PageHeader
        title={`Edit ${user.name}`}
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Users', href: '/users' },
          { title: user.name },
        ]}
        rightSection={
          <Button
            rightSection={<IconArrowBack size={14} />}
            component={Link}
            to={`/users/${user.id}`}
            variant="default">
            Show
          </Button>
        }
      />

      <Form
        user={user}
        onSuccess={() => {
          reload();
          navigate(`/users/${user.id}`);
        }}
      />
    </Stack>
  );
}
