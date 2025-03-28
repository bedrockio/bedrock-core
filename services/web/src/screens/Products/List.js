import React from 'react';
import { Link } from '@bedrockio/router';
import {
  Group,
  Table,
  Button,
  Image,
  Divider,
  Tooltip,
  Anchor,
  Loader,
} from '@mantine/core';
import { IconPlus, IconHelp } from '@tabler/icons-react';

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
      sellingPoints: {
        label: 'Selling Points',
        multiple: true,
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
                    <SearchFilters.Dropdown
                      search
                      multiple
                      selection
                      name="sellingPoints"
                      label="Selling Points"
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

              <Table stickyHeader mt="md">
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
                      <Group>
                        Created
                        <Tooltip
                          withArrow
                          multiline={true}
                          label="This is the date and time the product was created.">
                          <IconHelp size={14} />
                        </Tooltip>
                      </Group>
                    </SortableTh>
                    <Table.Th width={50}>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
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
                        <Table.Td align="right">
                          <Actions product={product} reload={reload} />
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
              <Divider my="md" />
              <Search.Pagination />
            </React.Fragment>
          );
        }}
      </Search.Provider>
    </>
  );
}
