import { Space } from '@mantine/core';
import { useNavigate } from '@bedrockio/router';
import BackLink from 'components/BackLink';
import Form from './Form';

export default function NewTemplate() {
  const navigate = useNavigate();

  return (
    <>
      <BackLink />
      <Space m="md" />
      <Form
        onSuccess={(template) => {
          navigate(`/templates/${template.id}`);
        }}
        onCancel={() => {
          navigate('/templates');
        }}
      />
    </>
  );
}
