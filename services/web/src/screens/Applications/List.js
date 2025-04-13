import {
  Table,
  Button,
  Group,
  Space,
  Code,
  ActionIcon,
  Anchor,
} from '@mantine/core';

import { Link } from '@bedrockio/router';

import Search from 'components/Search';
import Confirm from 'components/Confirm';

import EditApplication from 'modals/EditApplication';

import { request } from 'utils/api';
import Meta from 'components/Meta';

import PageHeader from 'components/PageHeader';
import { IconPlus } from '@tabler/icons-react';
import { fromNow } from 'utils/date';

export default function Applications() {
  const onDataNeeded = async (body) => {
    return await request({
      method: 'POST',
      path: '/1/applications/mine/search',
      body,
    });
  };

  return (
    <>
      <Meta title="Applications" />
      <Search.Provider onDataNeeded={onDataNeeded}>
        {({ items, getSorted, setSort, reload, loading, error }) => {
          return (
            <>
              <PageHeader
                title="Applications"
                breadcrumbItems={[
                  {
                    href: '/',
                    title: 'Home',
                  },
                  {
                    title: 'Applications',
                  },
                ]}
                description="Manage your applications"
                icon={<i className="fa fa-cubes" />}
                rightSection={
                  <Button
                    component={Link}
                    to="/applications/new"
                    rightSection={<IconPlus size={14} />}>
                    New Application
                  </Button>
                }
              />

              <Table mt="md" striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSort('name')}>
                      Name{' '}
                      {getSorted('name') === 'asc'
                        ? '↑'
                        : getSorted('name') === 'desc'
                          ? '↓'
                          : ''}
                    </Table.Th>
                    <Table.Th style={{ width: '25%' }}>Description</Table.Th>
                    <Table.Th>APIKey</Table.Th>
                    <Table.Th>Request Count</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {items.map((item) => {
                    return (
                      <Table.Tr key={item.id}>
                        <Table.Td>
                          <Anchor
                            size="sm"
                            component={Link}
                            to={`/applications/${item.id}`}>
                            {item.name}
                          </Anchor>
                        </Table.Td>
                        <Table.Td>{item.description}</Table.Td>
                        <Table.Td>
                          <Code>{item.apiKey}</Code>
                        </Table.Td>
                        <Table.Td>
                          {item.lastUsedAt ? fromNow(item.lastUsedAt) : 'N / A'}
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'center' }}>
                          <Group position="center" spacing="xs">
                            <EditApplication
                              application={item}
                              trigger={
                                <ActionIcon variant="light">
                                  <i className="fa fa-pen-to-square" />
                                </ActionIcon>
                              }
                              onSave={reload}
                            />
                            <Confirm
                              negative
                              confirmButton="Delete"
                              header={`Are you sure you want to delete "${item.name}"?`}
                              content="All data will be permanently deleted"
                              trigger={
                                <ActionIcon variant="light" color="red">
                                  <i className="fa fa-trash" />
                                </ActionIcon>
                              }
                              onConfirm={async () => {
                                await request({
                                  method: 'DELETE',
                                  path: `/1/applications/${item.id}`,
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

              <Space h="md" />
              <Search.Pagination />
            </>
          );
        }}
      </Search.Provider>
    </>
  );
}
