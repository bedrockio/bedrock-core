import { Link } from '@bedrockio/router';

import {
  Anchor,
  Badge,
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
import SortableTh from 'components/Table/SortableTh';

import { request } from 'utils/api';
import { formatDateTime } from 'utils/date';
import { formatRoles } from 'utils/permissions';

import Actions from './Actions';

export default function UserList() {
  async function onDataNeeded({ roles, ...body }) {
    return await request({
      method: 'POST',
      path: '/1/users/search',
      body: {
        ...body,
        roles: roles && {
          role: roles.map((role) => role.id || role),
        },
      },
    });
  }

  async function fetchRoles() {
    const { data } = await request({
      method: 'GET',
      path: `/1/users/roles`,
    });

    return { data };
  }

  function getFilterMapping() {
    return {
      createdAt: {
        label: 'Created At',
        type: 'date',
        range: true,
      },
      keyword: {},
    };
  }

  return (
    <>
      <Search.Provider
        onDataNeeded={onDataNeeded}
        filterMapping={getFilterMapping()}>
        {({ items: users, getSorted, setSort, reload, error, loading }) => {
          return (
            <Stack>
              <PageHeader
                title="Users"
                breadcrumbItems={[
                  {
                    href: '/',
                    title: 'Home',
                  },
                  {
                    title: 'Users',
                  },
                ]}
                rightSection={
                  <>
                    <Search.Export filename="users" />
                    <Button variant="primary" component={Link} to="/users/new">
                      New User
                    </Button>
                  </>
                }
              />

              <Group justify="space-between">
                <Group>
                  <SearchFilters.Modal>
                    <SearchFilters.Select
                      onDataNeeded={fetchRoles}
                      name="roles"
                      label="Roles"
                      multiple
                    />
                    <SearchFilters.DateRange
                      label="Created At"
                      name="createdAt"
                    />
                  </SearchFilters.Modal>
                  {loading && <Loader size={'sm'} />}
                </Group>

                <Group>
                  <Search.Total />
                  <SearchFilters.Keyword />
                </Group>
              </Group>

              <ErrorMessage error={error} />

              <Table.ScrollContainer>
                <Table stickyHeader striped>
                  <Table.Thead>
                    <Table.Tr>
                      <SortableTh
                        sorted={getSorted('firstName')}
                        onClick={() => setSort('firstName')}
                        width={200}>
                        Name
                      </SortableTh>
                      <SortableTh
                        sorted={getSorted('email')}
                        onClick={() => setSort('email')}>
                        Email
                      </SortableTh>
                      <SortableTh
                        sorted={getSorted('phone')}
                        onClick={() => setSort('phone')}>
                        Phone
                      </SortableTh>
                      <SortableTh
                        sorted={getSorted('roles')}
                        onClick={() => setSort('roles')}>
                        Role
                      </SortableTh>
                      <SortableTh
                        sorted={getSorted('createdAt')}
                        onClick={() => setSort('createdAt')}
                        width={280}>
                        Created
                      </SortableTh>
                      <Table.Th
                        style={{
                          textAlign: 'right',
                        }}
                        width={100}>
                        Actions
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {users.length === 0 && (
                      <Table.Tr>
                        <Table.Td colSpan={5}>
                          <Text p="md" fw="bold" ta="center">
                            No users found.
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    )}
                    {users.map((user) => {
                      return (
                        <Table.Tr key={user.id}>
                          <Table.Td>
                            <Anchor
                              size="sm"
                              component={Link}
                              to={`/users/${user.id}`}>
                              {user.name}
                            </Anchor>
                          </Table.Td>
                          <Table.Td>{user.email}</Table.Td>
                          <Table.Td>{user.phone}</Table.Td>
                          <Table.Td>
                            {formatRoles(user.roles).map((label) => {
                              return (
                                <Badge
                                  variant="default"
                                  size="md"
                                  radius="md"
                                  leftSection={<label.icon size={14} />}
                                  key={label.key}>
                                  {label.content}
                                </Badge>
                              );
                            })}
                          </Table.Td>
                          <Table.Td>{formatDateTime(user.createdAt)}</Table.Td>
                          <Table.Td align="right">
                            <Actions
                              displayMode="list"
                              user={user}
                              reload={reload}
                            />
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
                <Search.Pagination />
              </Table.ScrollContainer>
            </Stack>
          );
        }}
      </Search.Provider>
    </>
  );
}
