import PageHeader from 'components/PageHeader';

import Form from './Form';
import { Box, Button } from '@mantine/core';
import { useNavigate } from '@bedrockio/router';
import { Link } from '@bedrockio/router';

import { IconArrowRight } from '@tabler/icons-react';

export default function NewShop() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="New Shop"
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Shops', href: '/shops' },
          { title: 'New Shop' },
        ]}
        rightSection={
          <Button
            component={Link}
            to="/shops"
            variant="default"
            rightSection={<IconArrowRight size={14} />}>
            Back
          </Button>
        }
      />
      <Box mt="md">
        <Form
          onSuccess={(shop) => {
            navigate(`/shops/${shop.id}`);
          }}
        />
      </Box>
    </>
  );
}
