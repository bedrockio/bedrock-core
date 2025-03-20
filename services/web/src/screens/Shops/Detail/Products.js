import React from 'react';
import { Message, Loader, Divider } from 'semantic';
import { Link } from '@bedrockio/router';
import { Paper, Group, Title, Table, Button, Image } from '@mantine/core';

import { IconPencil } from '@tabler/icons-react';
import { usePage } from 'stores/page';

import Layout from 'components/Layout';
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
      <Search.Provider onDataNeeded={onDataNeeded}>
        {({ items: products, getSorted, setSort, reload, loading, error }) => {
          return (
            <React.Fragment>
              <Menu />
              <Paper shadow="md" p="md" withBorder>
                <Group>
                  <Title order={2}>Products</Title>
                  <Layout horizontal right center>
                    <Search.Total />
                    <SearchFilters.Keyword />
                  </Layout>
                </Group>
                <ErrorMessage error={error} />
                {loading ? (
                  <Loader active />
                ) : products.length === 0 ? (
                  <Message>No products added yet</Message>
                ) : (
                  <Table stickyHeader striped>
                    <Table.Thead>
                      <Table.Tr>
                        {/* --- Generator: list-header-cells */}
                        <Table.Th
                          sorted={getSorted('name')}
                          onClick={() => setSort('name')}>
                          Name
                        </Table.Th>
                        {/* --- Generator: end */}
                        <Table.Th width={50}>Image</Table.Th>
                        <Table.Th
                          onClick={() => setSort('priceUsd')}
                          sorted={getSorted('priceUsd')}>
                          Price
                        </Table.Th>
                        <Table.Th
                          sorted={getSorted('createdAt')}
                          onClick={() => setSort('createdAt')}>
                          Created
                          <HelpTip
                            title="Created"
                            text="This is the date and time the item was created."
                          />
                        </Table.Th>
                        <Table.Th width={200}>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
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
                )}
                <Divider hidden />
                <Search.Pagination />
              </Paper>
            </React.Fragment>
          );
        }}
      </Search.Provider>
    </>
  );
}
