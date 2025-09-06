import { useNavigate } from '@bedrockio/router';
import { Space } from '@mantine/core';

import { usePage } from 'stores/page';

import BackLink from 'components/BackLink';

import Form from '../Form';

export default function TemplateEdit() {
  const { template, reload } = usePage();
  const navigate = useNavigate();

  return (
    <>
      <BackLink />
      <Space m="md" />
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
