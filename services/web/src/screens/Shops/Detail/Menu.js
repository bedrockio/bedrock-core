import React from 'react';
import { Link } from '@bedrockio/router';

import { usePage } from 'stores/page';

import { Button } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';

import PageHeader from 'components/PageHeader.js';
import Actions from '../Actions';

export default () => {
  const { shop, reload } = usePage();

  const items = [{ title: 'Shops', href: '/shops' }, { title: shop.name }];

  const tabs = [
    { title: 'Overview', href: `/shops/${shop.id}` },
    { title: 'Products', href: `/shops/${shop.id}/products` },
  ];

  return (
    <React.Fragment>
      <PageHeader
        title={shop.name}
        breadcrumbItems={items}
        rightSection={
          <>
            <Actions shop={shop} reload={reload} />
            <Button
              component={Link}
              to={`/shops/${shop.id}/edit`}
              rightSection={<IconPencil size={14} />}>
              Edit
            </Button>
          </>
        }
        tabs={tabs}
      />
    </React.Fragment>
  );
};
