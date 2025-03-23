import React from 'react';
import { Link } from '@bedrockio/router';
import {
  Paper,
  Group,
  Table,
  Button,
  Image,
  Divider,
  Tooltip,
  Anchor,
  Text,
  Title,
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
      <Meta title="Products" />
      <Menu />
      <Paper mt="md" shadow="md" p="md" withBorder>
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
                  <Group>
                    <Title order={4}>Products</Title>
                    {loading && <Loader size="sm" />}
                  </Group>
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
                            objectFit="contain"
                            src={urlForUpload(product.images[0])}
                          />
                        </Table.Td>
                        <Table.Td>{formatUsd(product.priceUsd)}</Table.Td>
                        <Table.Td>{formatDateTime(product.createdAt)}</Table.Td>
                        <Table.Td textAlign="center">
                          <Group gap="md">
                            <Actions product={product} reload={reload} />
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>

                <Divider my="md" />
                <Search.Pagination />
              </React.Fragment>
            );
          }}
        </Search.Provider>
      </Paper>
    </>
  );
}
