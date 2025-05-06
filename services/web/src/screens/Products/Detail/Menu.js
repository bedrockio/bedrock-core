import PageHeader from 'components/PageHeader';

import { usePage } from 'stores/page';
import Actions from '../Actions';

export default function ProductMenu({ displayMode }) {
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
    <PageHeader
      title={product.name}
      breadcrumbItems={items}
      tabs={
        displayMode !== 'edit' && [
          {
            title: 'Overview',
            href: `/products/${product.id}`,
          },
        ]
      }
      rightSection={
        <Actions displayMode={displayMode} product={product} reload={reload} />
      }
    />
  );
}
