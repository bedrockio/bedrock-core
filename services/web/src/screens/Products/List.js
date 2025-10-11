import { Link } from '@bedrockio/router';

import {
  Anchor,
  Button,
  Group,
  Image,
  Loader,
  Stack,
  Table,
  Text,
} from '@mantine/core';

import ErrorMessage from 'components/ErrorMessage';
import PageHeader from 'components/PageHeader';
import Search from 'components/Search';
import SearchFilters from 'components/Search/Filters';

import { request } from 'utils/api';
import { formatUsd } from 'utils/currency';
import { formatDateTime } from 'utils/date';
import { urlForUpload } from 'utils/uploads';

import Actions from './Actions';

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
      {({ items: products, reload, error, loading }) => {
        return (
          <Stack>
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

                  <Button variant="primary" component={Link} to="/products/new">
                    New Product
                  </Button>
                </>
              }
            />

            <Group justify="space-between">
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
                <Search.Status />
                <SearchFilters.Keyword />
              </Group>
            </Group>

            <ErrorMessage error={error} />

            <Table stickyHeader striped>
              <Table.Thead>
                <Table.Tr>
                  <Search.Header name="name">Name</Search.Header>
                  <Search.Header width={60}>Image</Search.Header>
                  <Search.Header name="priceUsd">Price</Search.Header>
                  <Search.Header name="createdAt" width={280}>
                    Created
                  </Search.Header>
                  <Search.Header
                    style={{
                      textAlign: 'right',
                    }}>
                    Actions
                  </Search.Header>
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
                        <Actions
                          displayMode="list"
                          product={product}
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
  );
}
