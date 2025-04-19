import React from 'react';
import { Link } from '@bedrockio/router';
import {
  Text,
  Group,
  Table,
  Button,
  Badge,
  Divider,
  Tooltip,
  Anchor,
  Loader,
} from '@mantine/core';
import { IconPlus, IconHelp } from '@tabler/icons-react';
import PageHeader from 'components/PageHeader';

import Search from 'components/Search';

import SearchFilters from 'components/Search/Filters';
import ErrorMessage from 'components/ErrorMessage';

import { formatDateTime } from 'utils/date';
import { request } from 'utils/api';

import allCountries from 'utils/countries';
import { formatRoles } from 'utils/permissions';

const countries = allCountries.map(({ countryCode, nameEn }) => ({
  value: countryCode,
  text: nameEn,
  key: countryCode,
}));

import Actions from './Actions';
import SortableTh from 'components/Table/SortableTh';

export default function UserList() {
  async function onDataNeeded(body) {
    return await request({
      method: 'POST',
      path: '/1/users/search',
      body,
    });
  }

  function getFilterMapping() {
    return {
      role: {
        label: 'Role',
        getDisplayValue: (role) => role,
      },
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
            <React.Fragment>
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
                    <Button
                      variant="default"
                      component={Link}
                      to="/users/new"
                      rightSection={<IconPlus size={14} />}>
                      New User
                    </Button>
                  </>
                }
              />

              <Group justify="space-between" mt="md">
                <Group>
                  <SearchFilters.Modal>
                    <SearchFilters.Dropdown
                      data={[
                        { value: 'admin', text: 'Admin' },
                        { value: 'user', text: 'User' },
                      ]}
                      name="role"
                      label="Role"
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
                <Table stickyHeader striped mt={'md'}>
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
                            <Actions compact user={user} reload={reload} />
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
                <Divider mb="md" />
                <Search.Pagination />
              </Table.ScrollContainer>
            </React.Fragment>
          );
        }}
      </Search.Provider>
    </>
  );
}
