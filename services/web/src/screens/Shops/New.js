import PageHeader from 'components/PageHeader';

import Form from './Form';
import { Button, Stack } from '@mantine/core';
import { useNavigate } from '@bedrockio/router';
import { Link } from '@bedrockio/router';

export default function NewShop() {
  const navigate = useNavigate();

  return (
    <Stack gap="md">
      <PageHeader
        title="New Shop"
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Shops', href: '/shops' },
          { title: 'New Shop' },
        ]}
        rightSection={
          <Button component={Link} to="/shops" variant="default">
            Back
          </Button>
        }
      />
      <Form
        onSuccess={(shop) => {
          navigate(`/shops/${shop.id}`);
        }}
        onCancel={() => {
          navigate('/shops');
        }}
      />
    </Stack>
  );
}
