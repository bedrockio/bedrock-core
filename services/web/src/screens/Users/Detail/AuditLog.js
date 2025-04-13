import React from 'react';
import { Link } from '@bedrockio/router';
import { Table, Paper, Space, Group, Code, Tooltip } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

import HelpTip from 'components/HelpTip';
import Breadcrumbs from 'components/Breadcrumbs';
import Layout from 'components/Layout';
import Search from 'components/Search';
import SearchFilters from 'components/Search/Filters';
//import ShowAuditEntry from 'modals/ShowAuditEntry';

import { request } from 'utils/api';
import { formatDateTime } from 'utils/date';
import Meta from 'components/Meta';

export default function AuditLog() {
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

  return (
    <>
      <Meta title="Audit Logs" />
      <Search.Provider
        //filterMapping={getFilterMapping()}
        onDataNeeded={onDataNeeded}>
        {({ items, getSorted, setSort }) => {
          return (
            <React.Fragment>
              <Breadcrumbs active="Organizations" />

              <Layout horizontal center spread>
                <h1>Audit Trail</h1>
                <Group></Group>
              </Layout>
              <Paper p="md" shadow="xs" withBorder>
                <Group position="apart">
                  <SearchFilters.Modal></SearchFilters.Modal>
                  <Group>
                    <Search.Total />
                    <SearchFilters.Keyword placeholder="Enter ObjectId" />
                  </Group>
                </Group>
              </Paper>

              <Space h="md" />
              <Search.Status />

              {items.length !== 0 && (
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Actor</Table.Th>
                      <Table.Th>Activity</Table.Th>
                      <Table.Th>Object Owner</Table.Th>
                      <Table.Th>Request</Table.Th>
                      <Table.Th onClick={() => setSort('createdAt')}>
                        Date
                        <Tooltip label="This is the date and time the organization was created">
                          <span> ℹ️</span>
                        </Tooltip>
                      </Table.Th>
                      <Table.Th>Actions</Table.Th>
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
                          <Code>
                            {item.requestMethod} {item.requestUrl}
                          </Code>
                        </Table.Td>
                        <Table.Td>{formatDateTime(item.createdAt)}</Table.Td>
                        <Table.Td style={{ textAlign: 'center' }}>
                          {/*
                            <Tooltip label="View details">
                              <ActionIcon 
                                variant="subtle"
                                onClick={() => {/* show modal */
                          /*}}
                              >
                                <IconSearch size={16} />
                              </ActionIcon>
                            </Tooltip>
                          */}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
              <Space h="md" />
              <Search.Pagination />
            </React.Fragment>
          );
        }}
      </Search.Provider>
    </>
  );
}
