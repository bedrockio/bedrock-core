import Form from '../Form.js';

import { usePage } from 'stores/page';

import { Stack } from '@mantine/core';
import { useNavigate } from '@bedrockio/router';
import PageHeader from 'components/PageHeader';
import Actions from '../Actions.js';

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
          { title: user.name, href: `/users/${user.id}` },
          { title: 'Edit' },
        ]}
        rightSection={<Actions  user={user} reload={reload} />}
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
