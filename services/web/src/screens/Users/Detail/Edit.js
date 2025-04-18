import Form from '../Form.js';

import { usePage } from 'stores/page';

import { Stack, Button } from '@mantine/core';
import { useNavigate, Link } from '@bedrockio/router';
import PageHeader from 'components/PageHeader';
import { IconEye } from '@tabler/icons-react';

export default function EditUser() {
  const { user, reload } = usePage();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title={`Edit ${user.name}`}
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Users', href: '/users' },
          { title: user.name },
        ]}
        rightSection={
          <Button
            leftSection={<IconEye size={14} />}
            component={Link}
            to={`/users/${user.id}`}
            variant="default">
            Show
          </Button>
        }
      />
      <Stack mt="md" gap="lg">
        <Form
          user={user}
          onSuccess={() => {
            reload();
            navigate(`/users/${user.id}`);
          }}
        />
      </Stack>
    </>
  );
}
