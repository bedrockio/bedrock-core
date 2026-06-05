import { Link, useNavigate } from '@bedrockio/router';

import PageHeader from 'components/PageHeader';

import { Button } from '@/components/ui/button';

import Form from './Form';

export default function NewUser() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="New User"
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Users', href: '/users' },
          { title: 'New User' },
        ]}
        rightSection={
          <Button asChild variant="outline">
            <Link to="/users">Back</Link>
          </Button>
        }
      />

      <Form
        onSuccess={(user) => {
          navigate(`/users/${user.id}`);
        }}
      />
    </div>
  );
}
