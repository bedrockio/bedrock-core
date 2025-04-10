import Form from '../Form.js';
import Menu from './Menu';

import { usePage } from 'stores/page';

import { Stack } from '@mantine/core';
import { useNavigate } from '@bedrockio/router';

export default function EditProduct() {
  const { product, reload } = usePage();
  const navigate = useNavigate();

  return (
    <Stack gap="lg">
      <Menu />
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
