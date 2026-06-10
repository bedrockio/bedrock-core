import { Link, useNavigate } from '@bedrockio/router';

import PageHeader from 'components/PageHeader';

import { Button } from '@/components/ui/button';

import Form from './Form';

export default function NewShop() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="New Shop"
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Shops', href: '/shops' },
          { title: 'New Shop' },
        ]}
        rightSection={
          <Button asChild variant="outline">
            <Link to="/shops">Back</Link>
          </Button>
        }
      />
      <Form
        onSuccess={(shop) => {
          navigate(`/shops/${shop.id}`);
        }}
        onCancel={() => {
          navigate('/shops');
        }}
      />
    </div>
  );
}
