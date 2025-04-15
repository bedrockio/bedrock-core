import { useState } from 'react';
import { Link } from '@bedrockio/router';
import { Table, Drawer, Group, Anchor } from '@mantine/core';

import Menu from './Menu';
import Search from 'components/Search';
import SearchFilters from 'components/Search/Filters';

import { request } from 'utils/api';
import { formatDateTime } from 'utils/date';

import SortableTh from 'components/Table/SortableTh';
import { usePage } from 'stores/page';

export default function UserAuditLog() {
  const { user } = usePage();

  const [selectedItem, setSelectedItem] = useState();

  async function onDataNeeded(params) {
    const response = await request({
      method: 'POST',
      path: `/1/users/${user.id}/audit-entries/search`,
      body: {
        ...params,
      },
    });

    const store = {};

    (response.data || []).forEach((item) => {
      if (!item.ownerId || !item.ownerType) return;
      const list = store[item.ownerType] || [];
      list.push(item.ownerId);
      store[item.ownerType] = list;
    });

    return response;
  }

  async function fetchSearchOptions(props) {
    const { data } = await request({
      method: 'POST',
      path: '/1/audit-entries/search-options',
      body: props,
    });
    return data;
  }

  function getFilterMapping() {
    return {};
  }

  function renderActor(actor) {
    if (!actor) return null;
    const { id, name } = actor;

    if (id !== user.id) {
      return (
        <Anchor component={Link} to={`/users/${id}`}>
          {name}
        </Anchor>
      );
    }
    return name;
  }

  return (
    <>
      <Drawer
        position="right"
        opened={!!selectedItem}
        onClose={() => setSelectedItem(null)}>
        <Group>
          <Anchor component={Link} to={`/users/${user.id}`}>
            {user.name}
          </Anchor>
        </Group>
      </Drawer>
      <Menu />
      <Search.Provider
        filterMapping={getFilterMapping()}
        onDataNeeded={onDataNeeded}>
        {({ items, getSorted, setSort }) => {
          return (
            <>
              <Group mt="md" justify="space-between">
                <Group>
                  <SearchFilters.Modal></SearchFilters.Modal>
                  <Search.Status />
                </Group>

                <Group>
                  <Search.Total />
                  <SearchFilters.Keyword placeholder="Enter ObjectId" />
                </Group>
              </Group>

              {items.length !== 0 && (
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Actor</Table.Th>
                      <Table.Th>Activity</Table.Th>
                      <Table.Th>Object Type</Table.Th>
                      <Table.Th>Object Name</Table.Th>
                      <SortableTh
                        width={170}
                        sorted={getSorted('createdAt')}
                        onClick={() => setSort('createdAt')}>
                        Created At
                      </SortableTh>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>
                    {items.map((item) => (
                      <Table.Tr
                        key={item.id}
                        onClick={() => open()}
                        style={{
                          cursor: 'pointer',
                        }}>
                        <Table.Td>{renderActor(item.actor)}</Table.Td>
                        <Table.Td>{item.activity}</Table.Td>
                        <Table.Td>{item.objectType}</Table.Td>
                        <Table.Td>{item.object?.name || 'N / A'}</Table.Td>
                        <Table.Td align="right">
                          {formatDateTime(item.createdAt)}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
              <Search.Pagination />
            </>
          );
        }}
      </Search.Provider>
    </>
  );
}
