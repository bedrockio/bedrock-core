import PageHeader from 'components/PageHeader';

import Form from './Form';
import { Box } from '@mantine/core';
import { useNavigate } from '@bedrockio/router';

export default function NewShop() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="New Shop"
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Shops', href: '/shops' },
          { title: 'New Shop' },
        ]}
      />
      <Box mt="md">
        <Form
          onSuccess={(shop) => {
            navigate(`/shops/${shop.id}`);
          }}
        />
      </Box>
    </>
  );
}
