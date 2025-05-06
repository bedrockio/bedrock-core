import Form from '../Form.js';

import { usePage } from 'stores/page';

import { Stack } from '@mantine/core';
import { useNavigate } from '@bedrockio/router';
import Menu from './Menu';

export default function EditProduct() {
  const { product, reload } = usePage();
  const navigate = useNavigate();

  return (
    <Stack gap="md">
      <Menu displayMode="edit" />
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
