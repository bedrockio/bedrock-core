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

import { request } from 'utils/api';
import { formatDateTime } from 'utils/date';
import { formatRoles } from 'utils/permissions';
import { formatPhone } from 'utils/phone';

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

  return (
    <>
      <Search.Provider onDataNeeded={onDataNeeded}>
        {({ items: users, reload, error, loading }) => {
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
                    <Search.Export />
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
                  <Search.Status />
                  <SearchFilters.Keyword />
                </Group>
              </Group>

              <ErrorMessage error={error} />

              <Table.ScrollContainer>
                <Table stickyHeader striped>
                  <Table.Thead>
                    <Table.Tr>
                      <Search.Header name="firstName" width={200}>
                        Name
                      </Search.Header>
                      <Search.Header name="email">Email</Search.Header>
                      <Search.Header name="phone">Phone</Search.Header>
                      <Search.Header name="roles">Role</Search.Header>
                      <Search.Header name="createdAt" width={280}>
                        Created
                      </Search.Header>
                      <Search.Header
                        style={{
                          textAlign: 'right',
                        }}
                        width={100}>
                        Actions
                      </Search.Header>
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
                          <Table.Td>{formatPhone(user.phone)}</Table.Td>
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
