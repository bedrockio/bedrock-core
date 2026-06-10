import { useNavigate } from '@bedrockio/router';

import BackLink from 'components/BackLink';

import Form from './Form';

export default function NewTemplate() {
  const navigate = useNavigate();

  return (
    <>
      <BackLink />
      <div className="mt-4" />
      <Form
        onSuccess={(template) => {
          navigate(`/templates/${template.id}`);
        }}
      />
    </>
  );
}
