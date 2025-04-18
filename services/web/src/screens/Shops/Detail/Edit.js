import Form from '../Form.js';

import { usePage } from 'stores/page';

import { Button, Stack } from '@mantine/core';
import { useNavigate } from '@bedrockio/router';

import PageHeader from 'components/PageHeader.js';
import { Link } from '@bedrockio/router';
import { IconEye } from '@tabler/icons-react';

export default function EditShop() {
  const { shop, reload } = usePage();
  const navigate = useNavigate();

  return (
    <Stack gap="md">
      <PageHeader
        title={`Edit ${shop.name}`}
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Shops', href: '/shops' },
          { title: shop.name },
        ]}
        rightSection={
          <Button
            leftSection={<IconEye size={14} />}
            component={Link}
            to={`/shops/${shop.id}`}
            variant="default">
            Show
          </Button>
        }
      />
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
