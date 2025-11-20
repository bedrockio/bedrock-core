import { useNavigate } from '@bedrockio/router';
import { Paper } from '@mantine/core';
import React from 'react';

import { usePage } from 'stores/page';

import Form from '../Form';
import Menu from './Menu';

export default function EditUser() {
  const { user, reload } = usePage();
  const navigate = useNavigate();

  return (
    <React.Fragment>
      <Menu displayMode="edit" />
      <Paper p="md" withBorder>
        <Form
          user={user}
          onSuccess={() => {
            reload();
            navigate.back();
          }}
        />
      </Paper>
    </React.Fragment>
  );
}
