import React from 'react';
import { Loader, Divider } from 'semantic';
import { Link } from '@bedrockio/router';
import {
  Paper,
  Group,
  Title,
  Table,
  Button,
  Image,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';

import { IconHelp, IconPencil } from '@tabler/icons-react';
import { usePage } from 'stores/page';

import HelpTip from 'components/HelpTip';
import Search from 'components/Search';
import SearchFilters from 'components/Search/Filters';
import ErrorMessage from 'components/ErrorMessage';
import Actions from 'screens/Products/Actions';

import { formatDateTime } from 'utils/date';
import { formatUsd } from 'utils/currency';
import { request } from 'utils/api';

import { urlForUpload } from 'utils/uploads';

import Menu from './Menu';
import Meta from 'components/Meta';
import SortableTh from 'components/Table/SortableTh';

export default function ShopProducts() {
  const { shop } = usePage();

  async function onDataNeeded(params) {
    return await request({
      method: 'POST',
      path: '/1/products/search',
      body: {
        ...params,
        shop: shop.id,
      },
    });
  }

  return (
    <>
      <Meta title="Products" />
      <Menu />
      <Paper shadow="md" p="md" withBorder>
        <Stack spacing="md">
          <Search.Provider onDataNeeded={onDataNeeded}>
            {({
              items: products,
              getSorted,
              setSort,
              reload,
              loading,
              error,
            }) => {
              return (
                <React.Fragment>
                  <Group justify="space-between">
                    <Title order={2}>Products</Title>
                    <Group>
                      <Search.Total />
                      <SearchFilters.Keyword />
                    </Group>
                  </Group>
                  <ErrorMessage error={error} />
                  {loading && <Loader active />}

                  <Table stickyHeader striped>
                    <Table.Thead>
                      <Table.Tr>
                        <SortableTh
                          sorted={getSorted('name')}
                          onClick={() => setSort('name')}>
                          Name
                        </SortableTh>
                        {/* --- Generator: end */}
                        <Table.Th width={50}>Image</Table.Th>
                        <SortableTh
                          sorted={getSorted('priceUsd')}
                          onClick={() => setSort('priceUsd')}>
                          Price
                        </SortableTh>
                        <SortableTh
                          sorted={getSorted('createdAt')}
                          onClick={() => setSort('createdAt')}>
                          <Group>
                            Created
                            <Tooltip
                              withArrow
                              multiline={true}
                              label="This is the date and time the item was created.">
                              <IconHelp size={14} />
                            </Tooltip>
                          </Group>
                        </SortableTh>
                        <Table.Th width={200}>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {products.length === 0 && (
                        <Table.Tr>
                          <Table.Td colSpan={5}>
                            <Text p="md" fw={500} ta="center">
                              No products found.
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      )}
                      {products.map((product) => {
                        return (
                          <Table.Tr key={product.id}>
                            {/* --- Generator: list-body-cells */}
                            <Table.Td>
                              <Link to={`/products/${product.id}`}>
                                {product.name}
                              </Link>
                            </Table.Td>
                            {/* --- Generator: end */}
                            <Table.Td>
                              {product.images[0] && (
                                <Image
                                  h={50}
                                  objectFit="contain"
                                  src={urlForUpload(product.images[0])}
                                />
                              )}
                            </Table.Td>
                            <Table.Td>{formatUsd(product.priceUsd)}</Table.Td>
                            <Table.Td>
                              {formatDateTime(product.createdAt)}
                            </Table.Td>
                            <Table.Td textAlign="center">
                              <Button
                                component={Link}
                                to={`/products/${product.id}/edit`}
                                variant="default"
                                leftSection={<IconPencil size={14} />}>
                                Edit
                              </Button>
                              <Actions product={product} reload={reload} />
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>

                  <Divider hidden />
                  <Search.Pagination />
                </React.Fragment>
              );
            }}
          </Search.Provider>
        </Stack>
      </Paper>
    </>
  );
}
