import { Link, useNavigate } from '@bedrockio/router';

import PageHeader from 'components/PageHeader';

import { Button } from '@/components/ui/button';

import Form from './Form';

export default function NewShop() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="New Application"
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Applications', href: '/Applications' },
          { title: 'New Application' },
        ]}
        rightSection={
          <Button asChild variant="outline">
            <Link to="/applications">Back</Link>
          </Button>
        }
      />
      <Form
        onSave={() => {
          navigate(`/applications`);
        }}
      />
    </div>
  );
}
