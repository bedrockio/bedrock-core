import { Link } from '@bedrockio/router';
import { Button, Code, Stack, Table } from '@mantine/core';

import Meta from 'components/Meta';
import PageHeader from 'components/PageHeader';
import Search from 'components/Search';

import { request } from 'utils/api';
import { fromNow } from 'utils/date';

import Actions from './Actions';

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
        {({ items, reload }) => {
          return (
            <Stack>
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
                    variant="default"
                    component={Link}
                    to="/applications/new">
                    New Application
                  </Button>
                }
              />

              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Search.Header name="name">Name</Search.Header>
                    <Search.Header style={{ width: '25%' }}>
                      Description
                    </Search.Header>
                    <Search.Header>APIKey</Search.Header>
                    <Search.Header>Last Used</Search.Header>
                    <Search.Header
                      style={{
                        textAlign: 'right',
                      }}
                      width={100}>
                      Actions
                    </Search.Header>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {items.map((item) => {
                    return (
                      <Table.Tr key={item.id}>
                        <Table.Td>{item.name}</Table.Td>
                        <Table.Td>{item.description}</Table.Td>
                        <Table.Td>
                          <Code>{item.apiKey}</Code>
                        </Table.Td>
                        <Table.Td>
                          {item.lastUsedAt ? fromNow(item.lastUsedAt) : 'N / A'}
                        </Table.Td>
                        <Table.Td align="right">
                          <Actions
                            displayMode="list"
                            application={item}
                            reload={reload}
                          />
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
