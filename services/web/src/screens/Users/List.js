import React from 'react';
import { Link } from '@bedrockio/router';
import {
  Paper,
  Group,
  Table,
  Button,
  Badge,
  Divider,
  Tooltip,
  Anchor,
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
import { Loader } from 'semantic-ui-react';

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
      country: {
        label: 'Country',
        getDisplayValue: (id) => countries.find((c) => c.value === id)?.text,
      },
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
                      component={Link}
                      to="/users/new"
                      rightSection={<IconPlus size={14} />}>
                      New User
                    </Button>
                  </>
                }
              />

              <Paper mt="md" shadow="md" p="md" withBorder>
                <Group justify="space-between">
                  <Group>
                    <SearchFilters.Modal>
                      <SearchFilters.Dropdown
                        options={countries}
                        search
                        name="country"
                        label="Country"
                      />
                      <SearchFilters.Dropdown
                        options={[
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

                <Table stickyHeader striped mt="md">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th width={200}>Name</Table.Th>
                      <SortableTh
                        sorted={getSorted('email')}
                        onClick={() => setSort('email')}>
                        Email
                      </SortableTh>
                      <Table.Th
                        sorted={getSorted('role')}
                        onClick={() => setSort('role')}>
                        Role
                      </Table.Th>
                      <SortableTh
                        sorted={getSorted('createdAt')}
                        onClick={() => setSort('createdAt')}
                        width={280}>
                        <Group>
                          Created
                          <Tooltip
                            withArrow
                            multiline={true}
                            label="This is the date and time the item was created.">
                            <IconHelp size={14} />
                          </Tooltip>
                        </Group>
                      </SortableTh>
                      <Table.Th width={120}>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
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
                          <Table.Td>
                            {formatRoles(user.roles).map((label) => {
                              return (
                                <Badge
                                  leftSection={<label.icon size={14} />}
                                  key={label.key}>
                                  {label.content}
                                </Badge>
                              );
                            })}
                          </Table.Td>
                          <Table.Td>{formatDateTime(user.createdAt)}</Table.Td>
                          <Table.Td align="center">
                            <Group gap="md">
                              <Actions user={user} reload={reload} />
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>

                <Divider my="md" />
                <Search.Pagination />
              </Paper>
            </React.Fragment>
          );
        }}
      </Search.Provider>
    </>
  );
}
