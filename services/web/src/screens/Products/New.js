import { useNavigate } from '@bedrockio/router';

import CloseButton from 'components/CloseButton';
import PageHeader from 'components/PageHeader';

import Form from './Form';

export default function NewProduct() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="New Product"
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Products', href: '/products' },
          { title: 'New Product' },
        ]}
        rightSection={<CloseButton to="/products" />}
      />
      <Form
        onSuccess={(product) => {
          navigate(`/products/${product.id}`);
        }}
      />
    </div>
  );
}
