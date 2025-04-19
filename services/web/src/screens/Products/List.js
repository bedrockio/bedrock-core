import React from 'react';
import { Link } from '@bedrockio/router';
import {
  Group,
  Table,
  Button,
  Image,
  Divider,
  Text,
  Anchor,
  Loader,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import PageHeader from 'components/PageHeader';

import Search from 'components/Search';

import SearchFilters from 'components/Search/Filters';
import ErrorMessage from 'components/ErrorMessage';

import { formatDateTime } from 'utils/date';
import { urlForUpload } from 'utils/uploads';
import { formatUsd } from 'utils/currency';
import { request } from 'utils/api';

import Actions from './Actions';
import SortableTh from 'components/Table/SortableTh';

export default function ProductList() {
  async function onDataNeeded(body) {
    return await request({
      method: 'POST',
      path: '/1/products/search',
      body,
    });
  }

  function getFilterMapping() {
    return {
      isFeatured: {
        label: 'Is Featured',
        type: 'boolean',
      },
      priceUsd: {
        label: 'Price Usd',
      },
      expiresAt: {
        label: 'Expires At',
        type: 'date',
        range: true,
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
    <Search.Provider
      onDataNeeded={onDataNeeded}
      filterMapping={getFilterMapping()}>
      {({ items: products, getSorted, setSort, reload, error, loading }) => {
        return (
          <React.Fragment>
            <PageHeader
              title="Products"
              breadcrumbItems={[
                {
                  href: '/',
                  title: 'Home',
                },
                {
                  title: 'Products',
                },
              ]}
              rightSection={
                <>
                  <Search.Export filename="products" />

                  <Button
                    variant="default"
                    component={Link}
                    to="/products/new"
                    rightSection={<IconPlus size={14} />}>
                    New Product
                  </Button>
                </>
              }
            />

            <Group mt="lg" justify="space-between">
              <Group>
                <SearchFilters.Modal>
                  <SearchFilters.Checkbox
                    name="isFeatured"
                    label="Is Featured"
                  />
                  <SearchFilters.Number name="priceUsd" label="Price Usd" />
                  <SearchFilters.DateRange
                    time
                    name="expiresAt"
                    label="Expires At"
                  />

                  <SearchFilters.DateRange
                    time
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

            <Table.ScrollContainer mt="md">
              <Table stickyHeader striped>
                <Table.Thead>
                  <Table.Tr>
                    <SortableTh
                      sorted={getSorted('name')}
                      onClick={() => setSort('name')}>
                      Name
                    </SortableTh>
                    <Table.Th width={60}>Image</Table.Th>
                    <SortableTh
                      sorted={getSorted('priceUsd')}
                      onClick={() => setSort('priceUsd')}>
                      Price
                    </SortableTh>
                    <SortableTh
                      sorted={getSorted('createdAt')}
                      onClick={() => setSort('createdAt')}
                      width={280}>
                      Created
                    </SortableTh>
                    <Table.Th
                      style={{
                        textAlign: 'right',
                      }}>
                      Actions
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {products.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={5} align="center">
                        <Text p="md" fw="bold" ta="center">
                          No products found.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                  {products.map((product) => {
                    const [image] = product.images;
                    return (
                      <Table.Tr key={product.id}>
                        <Table.Td>
                          <Anchor
                            size="sm"
                            component={Link}
                            to={`/products/${product.id}`}>
                            {product.name}
                          </Anchor>
                        </Table.Td>
                        <Table.Td>
                          {image && (
                            <Image
                              radius={4}
                              h={40}
                              w={40}
                              fit
                              src={urlForUpload(image, true)}
                            />
                          )}
                        </Table.Td>
                        <Table.Td>{formatUsd(product.priceUsd)}</Table.Td>
                        <Table.Td>{formatDateTime(product.createdAt)}</Table.Td>
                        <Table.Td align="right" width={100}>
                          <Actions compact product={product} reload={reload} />
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
              <Divider mb="md" />
              <Search.Pagination />
            </Table.ScrollContainer>
          </React.Fragment>
        );
      }}
    </Search.Provider>
  );
}
