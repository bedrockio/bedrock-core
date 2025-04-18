import PageHeader from 'components/PageHeader';

import Form from './Form';
import { Stack, Button } from '@mantine/core';
import { useNavigate, Link } from '@bedrockio/router';

import { IconArrowRight } from '@tabler/icons-react';

export default function NewShop() {
  const navigate = useNavigate();

  return (
    <Stack gap="md">
      <PageHeader
        title="New Product"
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Shops', href: '/shops' },
          { title: 'New Shop' },
        ]}
        rightSection={
          <Button
            component={Link}
            to="/products"
            variant="default"
            rightSection={<IconArrowRight size={14} />}>
            Back
          </Button>
        }
      />
      <Form
        onSuccess={(product) => {
          navigate(`/products/${product.id}`);
        }}
      />
    </Stack>
  );
}
