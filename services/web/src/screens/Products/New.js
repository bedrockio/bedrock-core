import { Link, useNavigate } from '@bedrockio/router';

import PageHeader from 'components/PageHeader';

import { Button } from '@/components/ui/button';

import Form from './Form';

export default function NewShop() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="New Product"
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Shops', href: '/shops' },
          { title: 'New Shop' },
        ]}
        rightSection={
          <Button asChild variant="outline">
            <Link to="/products">Back</Link>
          </Button>
        }
      />
      <Form
        onSuccess={(product) => {
          navigate(`/products/${product.id}`);
        }}
      />
    </div>
  );
}
