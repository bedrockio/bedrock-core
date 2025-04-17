import { Link } from '@bedrockio/router';
import { Table, Button, Divider, Group, Anchor } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

import PageHeader from 'components/PageHeader';

import Search from 'components/Search';
import SearchFilters from 'components/Search/Filters';
import ShowAuditEntry from 'modals/ShowAuditEntry';

import { request } from 'utils/api';
import { formatDateTime } from 'utils/date';
import Meta from 'components/Meta';
import SortableTh from 'components/Table/SortableTh';

export default function AuditLogList() {
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
      },
      ownerId: {
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
        filterMapping={getFilterMapping()}
        onDataNeeded={onDataNeeded}>
        {({ items, getSorted, setSort }) => (
          <>
            <PageHeader
              title="Audit Trail"
              breadcrumbItems={[
                {
                  href: '/',
                  title: 'Home',
                },
                {
                  title: 'Audit Logs',
                },
              ]}
            />
            <Group justify="space-between" mt="md">
              <Group>
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
                <Search.Status />
              </Group>
              <Group>
                <Search.Total />
              </Group>
            </Group>

            {items.length !== 0 && (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Actor</Table.Th>
                    <Table.Th>Activity</Table.Th>
                    <Table.Th>Object Owner</Table.Th>
                    <Table.Th>Object Name</Table.Th>
                    <SortableTh
                      width={170}
                      sorted={getSorted('createdAt')}
                      onClick={() => setSort('createdAt')}>
                      Date
                    </SortableTh>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {items.map((item) => (
                    <Table.Tr key={item.id}>
                      <Table.Td>
                        {item.actor && (
                          <Anchor
                            componet={Link}
                            title={item.actor.email}
                            to={`/users/${item.actor.id}`}>
                            {item.actor.firstName} {item.actor.lastName}
                          </Anchor>
                        )}
                      </Table.Td>

                      <Table.Td>{item.activity}</Table.Td>
                      <Table.Td>
                        {item.object?.name || item.object || 'N/A'}
                      </Table.Td>
                      <Table.Td>
                        {item.owner && (
                          <Link
                            title={item.owner.email}
                            to={`/users/${item.owner.id}`}>
                            {item.owner.name}
                          </Link>
                        )}
                      </Table.Td>
                      <Table.Td>{formatDateTime(item.createdAt)}</Table.Td>

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
