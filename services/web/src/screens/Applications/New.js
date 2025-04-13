import PageHeader from 'components/PageHeader';

import Form from './Form';
import { Box } from '@mantine/core';
import { useNavigate } from '@bedrockio/router';

export default function NewShop() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="New Application"
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Applications', href: '/Applications' },
          { title: 'New Application' },
        ]}
      />
      <Box mt="md">
        <Form
          onSave={() => {
            navigate(`/applications`);
          }}
        />
      </Box>
    </>
  );
}
