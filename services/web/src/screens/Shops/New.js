import React from 'react';

import Meta from 'components/Meta';
import PageHeader from 'components/PageHeader';

import Form from './Form';
import { Paper } from '@mantine/core';

export default function NewShop() {
  return (
    <>
      <Meta title="Shops" />
      <PageHeader
        title="New Shop"
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Shops', href: '/shops' },
          { title: 'New Shop' },
        ]}
      />
      <Paper shadow="md" p="md" withBorder mt="md">
        <Form />
      </Paper>
    </>
  );
}
