import {
  Group,
  Table,
  Button,
  Badge,
  Divider,
  Text,
  Loader,
  Stack,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import Search from 'components/Search';
import PageHeader from 'components/PageHeader';
import SearchFilters from 'components/Search/Filters';
import ErrorMessage from 'components/ErrorMessage';
import SortableTh from 'components/Table/SortableTh';
import InviteForm from './Form';
import Actions from './Actions';

import { modals } from '@mantine/modals';

import { formatDateTime } from 'utils/date';
import { request } from 'utils/api';

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
                  <Button
                    variant="default"
                    onClick={() => {
                      modals.open({
                        title: 'Invite Users',
                        children: (
                          <InviteForm
                            name="shop"
                            onSuccess={() => {
                              modals.closeAll();
                              reload();
                            }}
                          />
                        ),
                        size: 'md',
                      });
                    }}
                    rightSection={<IconPlus size={14} />}>
                    Invite User
                  </Button>
                }
              />

              <Group justify="space-between">
                <Group>
                  <SearchFilters.Modal>
                    <SearchFilters.Dropdown
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

              <Table.ScrollContainer>
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
                            <Badge radius="md" size="md">
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
                <Divider my="md" mt="0" />
                <Search.Pagination />
              </Table.ScrollContainer>
            </Stack>
          );
        }}
      </Search.Provider>
    </>
  );
}
