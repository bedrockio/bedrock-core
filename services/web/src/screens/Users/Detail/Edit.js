import { useNavigate } from '@bedrockio/router';
import { Stack } from '@mantine/core';

import { usePage } from 'stores/page';

import Form from '../Form';
import Menu from './Menu';

export default function EditUser() {
  const { user, reload } = usePage();
  const navigate = useNavigate();

  return (
    <Stack gap="md">
      <Menu displayMode="edit" />

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
