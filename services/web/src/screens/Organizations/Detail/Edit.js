import { PageContext } from 'stores/page';

import { useNavigate } from '@bedrockio/router';

import Form from '../Form.js';
import Menu from './Menu';

import { Stack } from '@mantine/core';
import { useContext } from 'react';

export default function OrganizationOverview() {
  const { organization, reload } = useContext(PageContext);
  const navigate = useNavigate();

  return (
    <Stack gap="lg">
      <Menu />
      <Form
        organization={organization}
        onSave={() => {
          reload();
          navigate('/organizations');
        }}
      />
    </Stack>
  );
}
