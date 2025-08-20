import { Table, Title, Image, Stack, Group, Text } from '@mantine/core';

import { usePage } from 'stores/page';

import { arrayToList } from 'utils/formatting';

import { formatDateTime } from 'utils/date';
import { urlForUpload } from 'utils/uploads';

import Menu from './Menu';
import { formatCurrency } from 'utils/currency';

export default function ShopOverview() {
  const { product } = usePage();
  return (
    <>
      <Menu />

      <Stack mt="md" spacing="md">
        <Text fz="md" lh="md">
          {product.description}
        </Text>
        <Title order={4}>Images</Title>
        <Group>
          {product.images.map((image) => (
            <Image
              w={300}
              fit="object-cover"
              radius="xs"
              key={image}
              src={urlForUpload(image)}
            />
          ))}
        </Group>

        <Table mt="md" variant="vertical" layout="fixed" withTableBorder>
          <Table.Tbody>
            <Table.Tr>
              <Table.Th w={160}>Price</Table.Th>
              <Table.Td>
                {formatCurrency(product.priceUsd || 0, 'USD')}
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th w={160}>Selling Points</Table.Th>
              <Table.Td>{arrayToList(product.sellingPoints)}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Created At</Table.Th>
              <Table.Td>{formatDateTime(product.createdAt)}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Updated At</Table.Th>
              <Table.Td>{formatDateTime(product.updatedAt)}</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Stack>
    </>
  );
}
