import React from 'react';
import PageHeader from 'components/PageHeader.js';

import { usePage } from 'stores/page';
import Actions from '../Actions';

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
        tabs={[
          {
            title: 'Overview',
            href: `/products/${product.id}`,
          },
        ]}
        rightSection={<Actions product={product} reload={reload} />}
      />
    </React.Fragment>
  );
};
