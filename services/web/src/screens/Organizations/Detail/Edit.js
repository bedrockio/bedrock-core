import { useNavigate } from '@bedrockio/router';
import { useContext } from 'react';

import { PageContext } from 'stores/page';

import Form from '../Form';
import Menu from './Menu';

export default function OrganizationOverview() {
  const { organization, reload } = useContext(PageContext);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <Menu displayMode="edit" />
      <Form
        organization={organization}
        onSuccess={() => {
          reload();
          navigate(`/organizations/${organization.id}`);
        }}
      />
    </div>
  );
}
