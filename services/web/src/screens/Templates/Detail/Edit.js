import { useNavigate } from '@bedrockio/router';

import { usePage } from 'stores/page';

import Form from '../Form';

export default function Edit() {
  const { template, reload } = usePage();
  const navigate = useNavigate();

  return (
    <>
      <Form
        template={template}
        onSuccess={() => {
          reload();
          navigate(`/templates/${template.id}`);
        }}
      />
    </>
  );
}
