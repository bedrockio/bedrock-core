import PageHeader from 'components/PageHeader.js';
import Form from '../Form.js';

import { usePage } from 'stores/page';

import { Stack, Paper } from '@mantine/core';
import { useNavigate } from '@bedrockio/router';

export default function EditShop() {
  const { shop, reload } = usePage();
  const navigate = useNavigate();

  return (
    <>
      <Stack gap="lg">
        <PageHeader
          title="Edit Shop"
          breadcrumbItems={[
            { title: 'Home', href: '/' },
            { title: 'Shops', href: '/shops' },
            { title: shop.name },
          ]}
        />

        <Form
          shop={shop}
          onSuccess={() => {
            reload();
            navigate(`/shops/${shop.id}`);
          }}
        />
      </Stack>
    </>
  );
}
