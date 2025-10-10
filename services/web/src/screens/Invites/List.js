import {
  Badge,
  Button,
  Group,
  Loader,
  Stack,
  Table,
  Text,
} from '@mantine/core';

import ErrorMessage from 'components/ErrorMessage';
import ModalWrapper from 'components/ModalWrapper';
import PageHeader from 'components/PageHeader';
import Search from 'components/Search';
import SearchFilters from 'components/Search/Filters';
import SortableTh from 'components/Table/SortableTh';

import { request } from 'utils/api';
import { formatDateTime } from 'utils/date';

import Actions from './Actions';
import InviteForm from './Form';

export default function Invites() {
  async function onDataNeeded(params) {
    return await request({
      method: 'POST',
      path: '/1/invites/search',
      body: params,
    });
  }

  function getFilterMapping() {
    return {
      status: {
        label: 'Status',
        getDisplayValue: (status) => status,
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
        filterMapping={getFilterMapping()}
        onDataNeeded={onDataNeeded}>
        {({ items, getSorted, setSort, reload, error, loading }) => {
          return (
            <Stack>
              <PageHeader
                title="Invites"
                breadcrumbItems={[
                  {
                    href: '/',
                    title: 'Home',
                  },
                  {
                    title: 'Invites',
                  },
                ]}
                rightSection={
                  <ModalWrapper
                    title="Invite Users"
                    size="md"
                    component={<InviteForm name="shop" onSuccess={reload} />}
                    trigger={<Button variant="default">Invite User</Button>}
                  />
                }
              />

              <Group justify="space-between">
                <Group>
                  <SearchFilters.Modal>
                    <SearchFilters.Select
                      name="status"
                      label="Status"
                      data={[
                        {
                          value: 'invited',
                          label: 'Invited',
                        },
                        {
                          value: 'accepted',
                          label: 'Accepted',
                        },
                      ]}
                    />

                    <SearchFilters.DateRange
                      name="createdAt"
                      label="Created At"
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

              <Table stickyHeader striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Email</Table.Th>
                    <SortableTh
                      sorted={getSorted('status')}
                      onClick={() => setSort('status')}>
                      Status
                    </SortableTh>
                    <SortableTh
                      sorted={getSorted('createdAt')}
                      onClick={() => setSort('createdAt')}
                      width={280}>
                      Invited At
                    </SortableTh>
                    <Table.Th width={60}>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {items.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={5}>
                        <Text p="md" fw="bold" ta="center">
                          No invites found.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                  {items.map((item) => {
                    return (
                      <Table.Tr key={item.id}>
                        <Table.Td>{item.email}</Table.Td>
                        <Table.Td>
                          <Badge radius="md" size="md" variant="default">
                            {item.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>{formatDateTime(item.createdAt)}</Table.Td>
                        <Table.Td align="right">
                          <Actions invite={item} reload={reload} />
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
              <Search.Pagination />
            </Stack>
          );
        }}
      </Search.Provider>
    </>
  );
}
