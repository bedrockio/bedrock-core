import { Link } from '@bedrockio/router';
import {
  Table,
  Badge,
  Button,
  Paper,
  Divider,
  Group,
  Box,
  Text,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

import HelpTip from 'components/HelpTip';
import Breadcrumbs from 'components/Breadcrumbs';
import Layout from 'components/Layout';
import Search from 'components/Search';
import SearchFilters from 'components/Search/Filters';
import ShowAuditEntry from 'modals/ShowAuditEntry';

import { request } from 'utils/api';
import { formatDateTime } from 'utils/date';
import Meta from 'components/Meta';

export default function AuditTrailList() {
  const onDataNeeded = async (params) => {
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
              include: ['firstName', 'lastName', 'email'],
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
  };

  const fetchUsers = async (props) => {
    const { data } = await request({
      method: 'POST',
      path: '/1/users/search',
      body: props,
    });
    return data;
  };

  const fetchSearchOptions = async (props) => {
    const { data } = await request({
      method: 'POST',
      path: '/1/audit-entries/search-options',
      body: props,
    });
    return data;
  };

  const getFilterMapping = () => {
    return {
      actor: {
        label: 'Actor',
        getDisplayValue: async (id) => {
          const data = await fetchUsers({ ids: [id] });
          return data[0].name;
        },
      },
      ownerId: {
        label: 'Owner',
        getDisplayValue: async (id) => {
          const data = await fetchUsers({ ids: [id] });
          return data[0].name;
        },
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

  const getColorForCategory = (category) => {
    switch (category) {
      case 'security':
        return 'red';
      case 'user':
        return 'blue';
      case 'system':
        return 'orange';
      default:
        return 'gray';
    }
  };

  return (
    <>
      <Meta title="Audit Logs" />
      <Search.Provider
        filterMapping={getFilterMapping()}
        onDataNeeded={onDataNeeded}>
        {({ items, getSorted, setSort }) => (
          <>
            <Breadcrumbs active="Organizations" />

            <Layout horizontal center spread>
              <h1>Audit Trail</h1>
              <Layout.Group></Layout.Group>
            </Layout>

            <Paper p="md" mb="md">
              <Layout horizontal center spread stackable>
                <SearchFilters.Modal>
                  <SearchFilters.Dropdown
                    onDataNeeded={(name) => fetchUsers({ name })}
                    search
                    name="actor"
                    label="Actor"
                  />
                  <SearchFilters.Dropdown
                    onDataNeeded={(name) => fetchUsers({ name })}
                    search
                    name="ownerId"
                    label="Owner"
                  />
                  <SearchFilters.Dropdown
                    onDataNeeded={() =>
                      fetchSearchOptions({ field: 'category' })
                    }
                    name="category"
                    label="Category"
                  />
                  <SearchFilters.Dropdown
                    onDataNeeded={() =>
                      fetchSearchOptions({ field: 'activity' })
                    }
                    name="activity"
                    label="Activity"
                  />
                  <SearchFilters.Dropdown
                    onDataNeeded={() =>
                      fetchSearchOptions({ field: 'objectType' })
                    }
                    name="objectType"
                    label="ObjectType"
                  />
                  <SearchFilters.Dropdown
                    onDataNeeded={() =>
                      fetchSearchOptions({ field: 'sessionId' })
                    }
                    name="sessionId"
                    label="Session Id"
                  />
                </SearchFilters.Modal>
                <Layout horizontal stackable center right>
                  <Search.Total />
                  <SearchFilters.Keyword placeholder="Enter ObjectId" />
                </Layout>
              </Layout>
            </Paper>

            <Search.Status />

            {items.length !== 0 && (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th w={150}>Actor</Table.Th>
                    <Table.Th w={100}>Category</Table.Th>
                    <Table.Th w={300}>Activity</Table.Th>
                    <Table.Th w={200}>Object Owner</Table.Th>
                    <Table.Th w={200}>Request</Table.Th>
                    <Table.Th
                      w={200}
                      onClick={() => setSort('createdAt')}
                      style={{ cursor: 'pointer' }}>
                      <Group spacing="xs">
                        <Text>Date</Text>
                        <HelpTip
                          title="Created"
                          text="This is the date and time the organization was created."
                        />
                      </Group>
                    </Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {items.map((item) => (
                    <Table.Tr key={item.id}>
                      <Table.Td>
                        {item.actor && (
                          <Link
                            title={item.actor.email}
                            to={`/users/${item.actor.id}`}>
                            {item.actor.firstName} {item.actor.lastName}
                          </Link>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={getColorForCategory(item.category)}
                          style={{ textTransform: 'capitalize' }}>
                          {item.category || 'default'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{item.activity}</Table.Td>
                      <Table.Td>
                        {item.owner && (
                          <Link
                            title={item.owner.email}
                            to={`/users/${item.owner.id}`}>
                            {item.owner.name}
                          </Link>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Box
                          style={{
                            fontFamily: 'monospace',
                            background: '#f5f5f5',
                            padding: '4px 8px',
                            borderRadius: '4px',
                          }}>
                          {item.requestMethod} {item.requestUrl}
                        </Box>
                      </Table.Td>
                      <Table.Td>{formatDateTime(item.createdAt)}</Table.Td>
                      <Table.Td style={{ textAlign: 'center' }}>
                        <ShowAuditEntry
                          auditEntry={item}
                          trigger={
                            <Button
                              variant="subtle"
                              size="sm"
                              p={0}
                              leftIcon={<IconSearch size={16} />}
                            />
                          }
                        />
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
            <Divider my="md" />
            <Search.Pagination />
          </>
        )}
      </Search.Provider>
    </>
  );
}
