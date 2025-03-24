import PageHeader from 'components/PageHeader.js';
import Form from '../Form.js';

import { usePage } from 'stores/page';

import { Stack, Paper } from '@mantine/core';
import { useNavigate } from '@bedrockio/router';

export default function EditUser() {
  const { user, reload } = usePage();
  const navigate = useNavigate();

  return (
    <>
      <Stack gap="lg">
        <PageHeader
          title="Edit User"
          breadcrumbItems={[
            { title: 'Home', href: '/' },
            { title: 'Users', href: '/users' },
            { title: user.name },
          ]}
        />
        <Paper shadow="md" p="md" withBorder>
          <Form
            user={user}
            onSuccess={() => {
              reload();
              navigate(`/users/${user.id}`);
            }}
          />
        </Paper>
      </Stack>
    </>
  );
}
