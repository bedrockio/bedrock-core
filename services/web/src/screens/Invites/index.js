import React from 'react';
import {
  Group,
  Table,
  Button,
  Badge,
  Divider,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconPlus, IconHelp, IconTrash } from '@tabler/icons-react';

import Search from 'components/Search';
import PageHeader from 'components/PageHeader';
import SearchFilters from 'components/Search/Filters';
import ErrorMessage from 'components/ErrorMessage';
import SortableTh from 'components/Table/SortableTh';
import InviteForm from './Form';

import { modals } from '@mantine/modals';

import { formatDateTime } from 'utils/date';
import { request } from 'utils/api';
import { Loader } from 'semantic-ui-react';

export default function Invites() {
  const openInvite = () => {
    modals.open({
      title: 'Invite Users',
      children: <InviteForm name="shop" onSuccess={() => modals.close()} />,
      size: 'md',
    });
  };

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
        multiple: true,
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
            <React.Fragment>
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
                    onClick={() => {
                      openInvite();
                    }}
                    rightSection={<IconPlus size={14} />}>
                    Invite User
                  </Button>
                }
              />

              <Group justify="space-between" mt="md">
                <Group>
                  <SearchFilters.Modal>
                    <SearchFilters.Dropdown
                      search
                      multiple
                      name="status"
                      label="Status"
                      options={[
                        {
                          value: 'invited',
                          text: 'Invited',
                        },
                        {
                          value: 'Accepted',
                          text: 'Accepted',
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

              <ErrorMessage mt="md" error={error} />

              <Table.ScrollContainer minWidth={300} mt="md">
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
                        <Group>
                          Invited At
                          <Tooltip
                            withArrow
                            multiline={true}
                            label="This is the date and time the invite was created.">
                            <IconHelp size={14} />
                          </Tooltip>
                        </Group>
                      </SortableTh>
                      <Table.Th width={120}>Actions</Table.Th>
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
                          <Table.Td>
                            <Group>
                              <Button
                                variant="outline"
                                size="xs"
                                //leftSection={<IconEnvelope size={14} />}
                                title="Resend Invite"
                                onClick={async () => {
                                  await request({
                                    method: 'POST',
                                    path: `/1/invites/${item.id}/resend`,
                                  });
                                  reload();
                                }}
                              />
                              <Button
                                variant="outline"
                                size="xs"
                                color="red"
                                leftSection={<IconTrash size={14} />}
                                title="Delete"
                                onClick={async () => {
                                  await request({
                                    method: 'DELETE',
                                    path: `/1/invites/${item.id}`,
                                  });
                                  reload();
                                }}
                              />
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>

              <Divider my="md" />
              <Search.Pagination />
            </React.Fragment>
          );
        }}
      </Search.Provider>
    </>
  );
}
