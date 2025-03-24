import PageHeader from 'components/PageHeader';

import Form from './Form';
import { Paper } from '@mantine/core';
import { useNavigate } from '@bedrockio/router';

export default function NewUser() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="New User"
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Users', href: '/users' },
          { title: 'New User' },
        ]}
      />
      <Paper shadow="md" p="md" withBorder mt="md">
        <Form
          onSuccess={(user) => {
            navigate(`/users/${user.id}`);
          }}
        />
      </Paper>
    </>
  );
}
