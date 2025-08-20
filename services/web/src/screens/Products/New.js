import PageHeader from 'components/PageHeader';

import Form from './Form';
import { Stack, Button } from '@mantine/core';
import { useNavigate, Link } from '@bedrockio/router';

export default function NewShop() {
  const navigate = useNavigate();

  return (
    <Stack>
      <PageHeader
        title="New Product"
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Shops', href: '/shops' },
          { title: 'New Shop' },
        ]}
        rightSection={
          <Button component={Link} to="/products" variant="default">
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
