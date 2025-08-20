import React from 'react';

import { usePage } from 'stores/page';

import PageHeader from 'components/PageHeader';

import Actions from '../Actions';

export default function ShopMenu({ displayMode }) {
  const { shop, reload } = usePage();

  const items = [
    {
      title: 'Home',
      href: '/',
    },
    { title: 'Shops', href: '/shops' },
    { title: shop.name },
  ];

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
          <Actions displayMode={displayMode} shop={shop} reload={reload} />
        }
        tabs={displayMode !== 'edit' && tabs}
      />
    </React.Fragment>
  );
}
