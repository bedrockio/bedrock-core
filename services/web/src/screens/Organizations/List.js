import { Link } from '@bedrockio/router';
import {
  Group,
  Table,
  Button,
  Divider,
  Text,
  Anchor,
  Loader,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import PageHeader from 'components/PageHeader';
import Search from 'components/Search';
import SearchFilters from 'components/Search/Filters';
import ErrorMessage from 'components/ErrorMessage';

import { formatDateTime } from 'utils/date';
import { request } from 'utils/api';

import Actions from './Actions';
import SortableTh from 'components/Table/SortableTh';

export default function OrganizationList() {
  async function onDataNeeded(body) {
    return await request({
      method: 'POST',
      path: '/1/organizations/search',
      body,
    });
  }

  function getFilterMapping() {
    return {
      keyword: {},
      createdAt: {
        label: 'Created At',
        type: 'date',
        range: true,
      },
    };
  }

  return (
    <>
      <Search.Provider
        onDataNeeded={onDataNeeded}
        filterMapping={getFilterMapping()}>
        {({
          items: organizations,
          getSorted,
          setSort,
          reload,
          error,
          loading,
        }) => (
          <>
            <PageHeader
              title="Organizations"
              breadcrumbItems={[
                { href: '/', title: 'Home' },
                { title: 'Organizations' },
              ]}
              rightSection={
                <Button
                  variant="default"
                  component={Link}
                  to="/organizations/new"
                  rightSection={<IconPlus size={14} />}>
                  New Organization
                </Button>
              }
            />

            <Group mt="lg" justify="space-between">
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
                <Search.Total />
                <SearchFilters.Keyword />
              </Group>
            </Group>

            <ErrorMessage error={error} />

            <Table.ScrollContainer minWidth={300} mt="md">
              <Table stickyHeader striped>
                <Table.Thead>
                  <Table.Tr>
                    <SortableTh
                      sorted={getSorted('name')}
                      onClick={() => setSort('name')}>
                      Name
                    </SortableTh>
                    <SortableTh
                      sorted={getSorted('createdAt')}
                      onClick={() => setSort('createdAt')}
                      width={280}>
                      Created
                    </SortableTh>
                    <Table.Th style={{ textAlign: 'right' }} width={100}>
                      Actions
                    </Table.Th>
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
                          compact
                          organization={organization}
                          reload={reload}
                        />
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
              <Divider my="md" mt="0" />
              <Search.Pagination />
            </Table.ScrollContainer>
          </>
        )}
      </Search.Provider>
    </>
  );
}
