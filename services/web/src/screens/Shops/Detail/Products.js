import React from 'react';
import { Link } from '@bedrockio/router';
import {
  Group,
  Table,
  Image,
  Divider,
  Tooltip,
  Anchor,
  Text,
  Box,
  Loader,
} from '@mantine/core';

import { IconHelp, IconPencil } from '@tabler/icons-react';
import { usePage } from 'stores/page';

import Meta from 'components/Meta';
import Search from 'components/Search';
import SearchFilters from 'components/Search/Filters';
import ErrorMessage from 'components/ErrorMessage';
import Actions from 'screens/Products/Actions';
import SortableTh from 'components/Table/SortableTh';

import { formatDateTime } from 'utils/date';
import { formatUsd } from 'utils/currency';
import { request } from 'utils/api';
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
                        <Actions product={product} reload={reload} />
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>

              <Divider my="md" />
              <Search.Pagination />
            </Box>
          );
        }}
      </Search.Provider>
    </>
  );
}
