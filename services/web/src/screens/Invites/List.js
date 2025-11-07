import { Badge, Button, Group, Stack, Table, Text } from '@mantine/core';

import ErrorMessage from 'components/ErrorMessage';
import ModalWrapper from 'components/ModalWrapper';
import PageHeader from 'components/PageHeader';
import Search from 'components/Search';
import SearchFilters from 'components/Search/Filters';

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

  return (
    <>
      <Search.Provider onDataNeeded={onDataNeeded}>
        {({ items, reload, error }) => {
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
                </Group>

                <Group>
                  <Search.Status />
                  <SearchFilters.Keyword />
                </Group>
              </Group>

              <ErrorMessage error={error} />

              <Table stickyHeader striped>
                <Table.Thead>
                  <Table.Tr>
                    <Search.Header>Email</Search.Header>
                    <Search.Header name="status">Status</Search.Header>
                    <Search.Header name="createdAt" width={280}>
                      Invited At
                    </Search.Header>
                    <Search.Header width={60}>Actions</Search.Header>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  <Search.EmptyMessage>
                    <Table.Tr>
                      <Table.Td colSpan={5}>
                        <Text p="md" fw="bold" ta="center">
                          No invites found.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  </Search.EmptyMessage>
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
