import Form from '../Form.js';

import { usePage } from 'stores/page';

import { Stack } from '@mantine/core';
import { useNavigate } from '@bedrockio/router';
import Menu from './Menu';

export default function EditUser() {
  const { user, reload } = usePage();
  const navigate = useNavigate();

  return (
    <>
      <Stack gap="lg">
        <Menu />
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
