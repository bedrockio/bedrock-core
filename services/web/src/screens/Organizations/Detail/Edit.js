import { PageContext } from 'stores/page';

import { useNavigate, Link } from '@bedrockio/router';

import Form from '../Form.js';

import { Stack, Button } from '@mantine/core';
import { useContext } from 'react';
import PageHeader from 'components/PageHeader.js';
import { IconEye } from '@tabler/icons-react';

export default function OrganizationOverview() {
  const { organization, reload } = useContext(PageContext);
  const navigate = useNavigate();

  return (
    <Stack gap="md">
      <PageHeader
        title={`Edit ${organization.name}`}
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Organizations', href: '/organizations' },
          { title: organization.name },
        ]}
        rightSection={
          <Button
            leftSection={<IconEye size={14} />}
            component={Link}
            to={`/organizations/${organization.id}`}
            variant="default">
            Show
          </Button>
        }
      />
      <Form
        organization={organization}
        onSuccess={() => {
          reload();
          navigate(`/organizations/${organization.id}`);
        }}
      />
    </Stack>
  );
}
