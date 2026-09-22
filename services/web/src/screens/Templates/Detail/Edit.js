import { useNavigate } from '@bedrockio/router';

import { usePage } from 'stores/page';

import Form from '../Form';
import Menu from './Menu';

export default function Edit() {
  const { template, reload } = usePage();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <Menu displayMode="edit" />
      <Form
        template={template}
        onSuccess={() => {
          reload();
          navigate(`/organization/templates/${template.id}`);
        }}
      />
    </div>
  );
}
