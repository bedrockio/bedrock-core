import { useNavigate } from '@bedrockio/router';
import { Stack } from '@mantine/core';

import { usePage } from 'stores/page';

import Form from '../Form';
import Menu from './Menu';

export default function EditShop() {
  const { shop, reload } = usePage();
  const navigate = useNavigate();

  return (
    <Stack>
      <Menu displayMode="edit" />
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
