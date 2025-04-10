import PageHeader from 'components/PageHeader';

import Form from './Form';
import { Box } from '@mantine/core';
import { useNavigate } from '@bedrockio/router';

export default function NewShop() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="New Organization"
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Organizations', href: '/organizations' },
          { title: 'Organization Shop' },
        ]}
      />
      <Box mt="md">
        <Form
          onSuccess={() => {
            navigate(`/organizations`);
          }}
        />
      </Box>
    </>
  );
}
