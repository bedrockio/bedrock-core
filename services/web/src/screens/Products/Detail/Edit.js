import Form from '../Form.js';
import PageHeader from 'components/PageHeader.js';

import { usePage } from 'stores/page';

import { Stack, Button } from '@mantine/core';
import { useNavigate } from '@bedrockio/router';

import { IconArrowBack } from '@tabler/icons-react';
import { Link } from '@bedrockio/router';

export default function EditProduct() {
  const { product, reload } = usePage();
  const navigate = useNavigate();

  return (
    <Stack gap="md">
      <PageHeader
        title={`Edit ${product.name}`}
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Products', href: '/products' },
          { title: product.name },
        ]}
        rightSection={
          <Button
            rightSection={<IconArrowBack size={14} />}
            component={Link}
            to={`/products/${product.id}`}
            variant="default">
            Show
          </Button>
        }
      />
      <Form
        product={product}
        onSuccess={() => {
          reload();
          navigate(`/products/${product.id}`);
        }}
      />
    </Stack>
  );
}
