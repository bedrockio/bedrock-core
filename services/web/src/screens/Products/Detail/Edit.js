import PageHeader from 'components/PageHeader.js';
import Form from '../Form.js';

import { usePage } from 'stores/page';

import { Stack, Paper } from '@mantine/core';
import { useNavigate } from '@bedrockio/router';

export default function EditProduct() {
  const { product, reload } = usePage();
  const navigate = useNavigate();

  return (
    <>
      <Stack gap="lg">
        <PageHeader
          title="Edit Product"
          breadcrumbItems={[
            { title: 'Home', href: '/' },
            { title: 'Products', href: '/products' },
            { title: product.name },
          ]}
        />
        <Paper shadow="md" p="md" withBorder>
          <Form
            product={product}
            onSuccess={() => {
              reload();
              navigate(`/products/${product.id}`);
            }}
          />
        </Paper>
      </Stack>
    </>
  );
}
