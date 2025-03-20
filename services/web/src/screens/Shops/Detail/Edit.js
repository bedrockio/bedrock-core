import Meta from 'components/Meta.js';
import PageHeader from 'components/PageHeader.js';
import Form from '../Form.js';

import { usePage } from 'stores/page';

import { Stack, Paper } from '@mantine/core';
import { useNavigate } from '@bedrockio/router';

export default function EditShop() {
  const { shop } = usePage();
  const navigate = useNavigate();

  return (
    <>
      <Meta title="Edit Shop" />
      <Stack gap="lg">
        <PageHeader
          title="Edit Shop"
          breadcrumbItems={[
            { title: 'Home', href: '/' },
            { title: 'Shops', href: '/shops' },
            { title: shop.name },
          ]}
        />
        <Paper shadow="md" p="md" withBorder>
          <Form
            shop={shop}
            onSuccess={() => {
              navigate(`/shops/${shop.id}`);
            }}
          />
        </Paper>
      </Stack>
    </>
  );
}
