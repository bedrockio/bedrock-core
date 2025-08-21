import { useNavigate } from '@bedrockio/router';
import { Stack } from '@mantine/core';
import { useContext } from 'react';

import { PageContext } from 'stores/page';

import Form from '../Form';
import Menu from './Menu';

export default function OrganizationOverview() {
  const { organization, reload } = useContext(PageContext);
  const navigate = useNavigate();

  return (
    <Stack>
      <Menu displayMode="edit" />
      <Form
        organization={organization}
        onSuccess={() => {
          reload();
          navigate(`/organizations/${organization.id}`);
        }}
      />
    </Stack>
  );
}
