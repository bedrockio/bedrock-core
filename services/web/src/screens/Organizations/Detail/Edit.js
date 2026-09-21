import { useNavigate } from '@bedrockio/router';
import { use } from 'react';

import { PageContext } from 'stores/page';

import Form from '../Form';
import Menu from './Menu';

export default function OrganizationOverview() {
  const { organization, reload } = use(PageContext);
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
