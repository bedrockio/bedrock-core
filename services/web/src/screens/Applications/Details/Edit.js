import Form from '../Form.js';

import { usePage } from 'stores/page';

import { Stack } from '@mantine/core';
import { useNavigate } from '@bedrockio/router';
import Menu from './Menu.js';

export default function EditApplication() {
  const { application, reload } = usePage();
  const navigate = useNavigate();

  return (
    <Stack gap="lg">
      <Menu />
      <Form
        application={application}
        onSave={() => {
          reload();
          navigate(`/applications`);
        }}
      />
    </Stack>
  );
}
