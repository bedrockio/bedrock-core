import { Link, useNavigate } from '@bedrockio/router';

import PageHeader from 'components/PageHeader';

import { Button } from '@/components/ui/button';

import Form from './Form';

export default function NewOrganization() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="New Organization"
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Organizations', href: '/organizations' },
          { title: 'Organization Shop' },
        ]}
        rightSection={
          <Button asChild variant="outline">
            <Link to="/organizations">Back</Link>
          </Button>
        }
      />
      <Form
        onSave={() => {
          navigate(`/organizations`);
        }}
      />
    </div>
  );
}
