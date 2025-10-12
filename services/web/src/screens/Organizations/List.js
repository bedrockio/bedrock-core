import { Link } from '@bedrockio/router';

import {
  Anchor,
  Button,
  Group,
  Loader,
  Stack,
  Table,
  Text,
} from '@mantine/core';

import ErrorMessage from 'components/ErrorMessage';
import PageHeader from 'components/PageHeader';
import Search from 'components/Search';
import SearchFilters from 'components/Search/Filters';

import { request } from 'utils/api';
import { formatDateTime } from 'utils/date';

import Actions from './Actions';

export default function OrganizationList() {
  async function onDataNeeded(body) {
    return await request({
      method: 'POST',
      path: '/1/organizations/search',
      body,
    });
  }

  return (
    <>
      <Search.Provider onDataNeeded={onDataNeeded}>
        {({ items: organizations, reload, error, loading }) => (
          <Stack>
            <PageHeader
              title="Organizations"
              breadcrumbItems={[
                { href: '/', title: 'Home' },
                { title: 'Organizations' },
              ]}
              rightSection={
                <>
                  <Button
                    variant="primary"
                    component={Link}
                    to="/organizations/new">
                    New Organization
                  </Button>
                </>
              }
            />

            <Group justify="space-between">
              <Group>
                <SearchFilters.Modal>
                  <SearchFilters.DateRange
                    time
                    name="createdAt"
                    label="Created At"
                  />
                </SearchFilters.Modal>
                {loading && <Loader size="sm" />}
              </Group>

              <Group>
                <Search.Status />
                <SearchFilters.Keyword />
              </Group>
            </Group>

            <ErrorMessage error={error} />

            <Table stickyHeader striped>
              <Table.Thead>
                <Table.Tr>
                  <Search.Header name="name">Name</Search.Header>
                  <Search.Header name="createdAt" width={280}>
                    Created
                  </Search.Header>
                  <Search.Header style={{ textAlign: 'right' }} width={100}>
                    Actions
                  </Search.Header>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {organizations.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={3} style={{ textAlign: 'center' }}>
                      <Text p="md" fw="bold" ta="center">
                        No organization found.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
                {organizations.map((organization) => (
                  <Table.Tr key={organization.id}>
                    <Table.Td>
                      <Anchor
                        size="sm"
                        component={Link}
                        to={`/organizations/${organization.id}`}>
                        {organization.name}
                      </Anchor>
                    </Table.Td>
                    <Table.Td>
                      {formatDateTime(organization.createdAt)}
                    </Table.Td>
                    <Table.Td align="right">
                      <Actions
                        displayMode="list"
                        organization={organization}
                        reload={reload}
                      />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            <Search.Pagination />
          </Stack>
        )}
      </Search.Provider>
    </>
  );
}
