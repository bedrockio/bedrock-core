import { Link } from '@bedrockio/router';
import { Anchor, Box, Group, Image, Loader, Table, Text } from '@mantine/core';

import { usePage } from 'stores/page';

import ErrorMessage from 'components/ErrorMessage';
import Search from 'components/Search';
import SearchFilters from 'components/Search/Filters';
import Actions from 'screens/Products/Actions';

import { request } from 'utils/api';
import { formatUsd } from 'utils/currency';
import { formatDateTime } from 'utils/date';
import { urlForUpload } from 'utils/uploads';

import Menu from './Menu';

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
      <Menu />

      <Search.Provider onDataNeeded={onDataNeeded}>
        {({ items: products, reload, loading, error }) => {
          return (
            <Box mt="md">
              <Group justify="space-between">
                <Group>{loading && <Loader size="sm" />}</Group>
                <Group>
                  <Search.Status />
                  <SearchFilters.Keyword />
                </Group>
              </Group>

              <ErrorMessage error={error} />

              <Table stickyHeader striped mt="md">
                <Table.Thead>
                  <Table.Tr>
                    <Search.Header name="name">Name</Search.Header>
                    <Search.Header width={60}>Image</Search.Header>
                    <Search.Header name="priceUsd">Price</Search.Header>
                    <Search.Header name="createdAt" width={280}>
                      Created
                    </Search.Header>
                    <Search.Header width={120}>Actions</Search.Header>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  <Search.EmptyMessage>
                    <Table.Tr>
                      <Table.Td colSpan={5}>
                        <Text p="md" fw="bold" ta="center">
                          No products found.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  </Search.EmptyMessage>
                  {products.map((product) => (
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
                        <Image
                          radius={4}
                          h={40}
                          w={40}
                          fit
                          src={urlForUpload(product.images[0])}
                        />
                      </Table.Td>
                      <Table.Td>{formatUsd(product.priceUsd)}</Table.Td>
                      <Table.Td>{formatDateTime(product.createdAt)}</Table.Td>
                      <Table.Td textAlign="center">
                        <Actions compact product={product} reload={reload} />
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>

              <Search.Pagination />
            </Box>
          );
        }}
      </Search.Provider>
    </>
  );
}
