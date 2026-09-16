import { useNavigate } from '@bedrockio/router';

import CloseButton from 'components/CloseButton';
import PageHeader from 'components/PageHeader';

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
        rightSection={<CloseButton to="/shops" />}
      />
      <Form
        onSuccess={(shop) => {
          navigate(`/shops/${shop.id}`);
        }}
      />
    </div>
  );
}
