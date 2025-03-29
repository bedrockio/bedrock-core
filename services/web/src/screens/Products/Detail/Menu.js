import React from 'react';
import PageHeader from 'components/PageHeader.js';

import { usePage } from 'stores/page';
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
        tabs={[
          {
            icon: <IconPencil size={12} />,
            title: 'Edit',
            href: `/products/${product.id}/edit`,
          },
        ]}
        rightSection={<Actions product={product} reload={reload} />}
      />
    </React.Fragment>
  );
};
