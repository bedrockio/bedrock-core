import { Link } from '@bedrockio/router';

import {
  ActionIcon,
  Anchor,
  Drawer,
  Group,
  Stack,
  Table,
  Text,
} from '@mantine/core';

import { useState } from 'react';
import { PiMagnifyingGlass } from 'react-icons/pi';

import Meta from 'components/Meta';
import PageHeader from 'components/PageHeader';
import Search from 'components/Search';
import SearchFilters from 'components/Search/Filters';

import { request } from 'utils/api';
import { formatDateTime } from 'utils/date';

import Overview from './Details/Overview';

export default function AuditLogList() {
  const [selectedItem, setSelectedItem] = useState(null);

  async function onDataNeeded(params) {
    const response = await request({
      method: 'POST',
      path: '/1/audit-entries/search',
      body: {
        ...params,
        include: ['*', 'actor.firstName', 'actor.lastName'],
      },
    });

    const store = {};

    (response.data || []).forEach((item) => {
      if (!item.ownerId || !item.ownerType) return;
      const list = store[item.ownerType] || [];
      list.push(item.ownerId);
      store[item.ownerType] = list;
    });

    // its split here because the owner could be a user or another collection
    const [users] = await Promise.all(
      Object.keys(store)
        .map((key) => {
          if (key === 'User') {
            const ids = [...new Set(store[key])];
            if (!ids.length) return null;
            return fetchUsers({
              ids,
              include: ['name', 'firstName', 'lastName', 'email'],
            });
          }
          // eslint-disable-next-line no-console
          console.error('[AuditLog] Unknown ownerType', key);
          return null;
        })
        .filter(Boolean),
    );

    response.data.forEach((item) => {
      if (item.ownerType === 'User') {
        const user = users?.find((u) => u.id === item.ownerId);
        if (!user) return;
        item.owner = user;
      }
    });

    return response;
  }

  async function fetchUsers(props) {
    const { data } = await request({
      method: 'POST',
      path: '/1/users/search',
      body: props,
    });
    return data;
  }

  async function fetchSearchOptions(props) {
    const { data } = await request({
      method: 'POST',
      path: '/1/audit-entries/search-options',
      body: props,
    });
    return data;
  }

  const getFilterMapping = () => {
    return {
      actor: {
        label: 'Actor',
      },
      ownerId: {
        label: 'Owner',
      },
      user: {
        label: 'Owner',
      },
      category: {
        label: 'Category',
      },
      activity: {
        label: 'Activity',
      },
      objectType: {
        label: 'Object Type',
      },
      object: {
        label: 'Object Id',
      },
      sessionId: {
        label: 'Session Id',
      },
      createdAt: {
        label: 'Created At',
        type: 'date',
        range: true,
      },
      keyword: {},
    };
  };

  return (
    <>
      <Meta title="Audit Log" />
      <Drawer
        position="right"
        opened={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={`Audit Entry: ${selectedItem?.activity}`}>
        <Overview auditEntry={selectedItem} />
      </Drawer>
      <Search.Provider
        filterMapping={getFilterMapping()}
        onDataNeeded={onDataNeeded}>
        {({ items }) => (
          <Stack>
            <PageHeader
              title="Audit Log"
              breadcrumbItems={[
                {
                  href: '/',
                  title: 'Home',
                },
                {
                  title: 'Audit Log',
                },
              ]}
            />
            <Group justify="space-between">
              <Group>
                <SearchFilters.Modal>
                  <SearchFilters.Select
                    onDataNeeded={fetchUsers}
                    name="actor"
                    label="Actor"
                  />
                  <SearchFilters.Select
                    onDataNeeded={fetchUsers}
                    name="ownerId"
                    label="Owner"
                  />
                  <SearchFilters.Select
                    onDataNeeded={() =>
                      fetchSearchOptions({ field: 'activity' })
                    }
                    name="activity"
                    label="Activity"
                  />
                  <SearchFilters.Select
                    onDataNeeded={() =>
                      fetchSearchOptions({ field: 'objectType' })
                    }
                    name="objectType"
                    label="ObjectType"
                  />
                  <SearchFilters.Keyword name="sessionId" label="Session Id" />
                  <SearchFilters.Keyword name="object" label="Object Id" />
                  <SearchFilters.DateRange
                    label="Created At"
                    name="createdAt"
                  />
                </SearchFilters.Modal>
                <Search.Status />
              </Group>
              <Group>
                <Search.Status />
              </Group>
            </Group>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Search.Header>Actor</Search.Header>
                  <Search.Header>Activity</Search.Header>
                  <Search.Header>Object Owner</Search.Header>
                  <Search.Header>Object Name</Search.Header>
                  <Search.Header name="createdAt" width={170}>
                    Date
                  </Search.Header>
                  <Search.Header style={{ textAlign: 'right' }}>
                    Actions
                  </Search.Header>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {items.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={6}>
                      <Text p="md" fw="bold" ta="center">
                        No entries found.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
                {items.map((item) => (
                  <Table.Tr key={item.id} onClick={() => setSelectedItem(item)}>
                    <Table.Td>
                      {item.actor && (
                        <Anchor
                          size="sm"
                          component={Link}
                          title={item.actor.email}
                          to={`/users/${item.actor.id}`}>
                          {item.actor.firstName} {item.actor.lastName}
                        </Anchor>
                      )}
                    </Table.Td>
                    <Table.Td>{item.activity}</Table.Td>

                    <Table.Td>
                      {item.owner && (
                        <Anchor
                          size="sm"
                          component={Link}
                          title={item.owner.email}
                          to={`/users/${item.owner.id}`}>
                          {item.owner.name}
                        </Anchor>
                      )}
                    </Table.Td>
                    <Table.Td>
                      {item.object?.name || item.object || 'N/A'}
                    </Table.Td>
                    <Table.Td>{formatDateTime(item.createdAt)}</Table.Td>

                    <Table.Td style={{ textAlign: 'right' }}>
                      <ActionIcon
                        variant="default"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}>
                        <PiMagnifyingGlass />
                      </ActionIcon>
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
