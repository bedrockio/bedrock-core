import { Link } from '@bedrockio/router';
import { Anchor, Box, Group, Image, Loader, Table, Text } from '@mantine/core';

import { usePage } from 'stores/page';

import ErrorMessage from 'components/ErrorMessage';
import Search from 'components/Search';
import SearchFilters from 'components/Search/Filters';
import SortableTh from 'components/Table/SortableTh';
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
        {({ items: products, getSorted, setSort, reload, loading, error }) => {
          return (
            <Box mt="md">
              <Group justify="space-between">
                <Group>{loading && <Loader size="sm" />}</Group>
                <Group>
                  <Search.Total />
                  <SearchFilters.Keyword />
                </Group>
              </Group>

              <ErrorMessage error={error} />

              <Table stickyHeader striped mt="md">
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
                    <Table.Th width={120}>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {products.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={5}>
                        <Text p="md" fw="bold" ta="center">
                          No products found.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
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
