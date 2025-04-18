import PageHeader from 'components/PageHeader';

import Form from './Form';
import { Stack } from '@mantine/core';
import { useNavigate } from '@bedrockio/router';

export default function NewShop() {
  const navigate = useNavigate();

  return (
    <>
      <Stack gap="md">
        <PageHeader
          title="New Product"
          breadcrumbItems={[
            { title: 'Home', href: '/' },
            { title: 'Shops', href: '/shops' },
            { title: 'New Shop' },
          ]}
        />

        <Form
          onSuccess={(product) => {
            navigate(`/products/${product.id}`);
          }}
        />
      </Stack>
    </>
  );
}
