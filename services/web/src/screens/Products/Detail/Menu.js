import React from 'react';
import PageHeader from 'components/PageHeader.js';

import { Button } from '@mantine/core';
import { usePage } from 'stores/page';
import { Link } from '@bedrockio/router';
import Actions from '../Actions';

import { IconPencil } from '@tabler/icons-react';

export default () => {
  const { product, reload } = usePage();

  const items = [
    {
      title: 'Home',
      href: '/',
    },
    { title: 'Products', href: '/products' },
    { title: product.name },
  ];

  return (
    <React.Fragment>
      <PageHeader
        title={product.name}
        breadcrumbItems={items}
        rightSection={
          <>
            <Actions product={product} reload={reload} />
            <Button
              component={Link}
              to={`/products/${product.id}/edit`}
              rightSection={<IconPencil size={14} />}>
              Edit
            </Button>
          </>
        }
      />
    </React.Fragment>
  );
};
