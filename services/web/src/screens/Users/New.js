import { useNavigate } from '@bedrockio/router';

import CloseButton from 'components/CloseButton';
import PageHeader from 'components/PageHeader';

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
        rightSection={<CloseButton to="/users" />}
      />

      <Form
        onSuccess={(user) => {
          navigate(`/users/${user.id}`);
        }}
      />
    </div>
  );
}
