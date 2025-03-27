import PageHeader from 'components/PageHeader.js';
import Form from '../Form.js';

import { usePage } from 'stores/page';

import { Stack } from '@mantine/core';
import { useNavigate } from '@bedrockio/router';
import Menu from './Menu';

export default function EditShop() {
  const { shop, reload } = usePage();
  const navigate = useNavigate();

  return (
    <Stack gap="lg">
      <Menu />
      <Form
        shop={shop}
        onSuccess={() => {
          reload();
          navigate(`/shops/${shop.id}`);
        }}
      />
    </Stack>
  );
}
