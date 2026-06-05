import { useNavigate } from '@bedrockio/router';
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
      <div className="mt-4">
        <Form
          user={user}
          onSuccess={() => {
            reload();
            navigate.back();
          }}
        />
      </div>
    </React.Fragment>
  );
}
