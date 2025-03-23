import { Table, Title, Image, Stack, Group, Paper, Text } from '@mantine/core';

import { usePage } from 'stores/page';
import Meta from 'components/Meta';

import { formatDateTime } from 'utils/date';
import { urlForUpload } from 'utils/uploads';

import Menu from './Menu';

export default function ProductOverview() {
  const { product } = usePage();

  return (
    <>
      <Menu />
      <Paper mt="md" shadow="md" p="md" withBorder>
        <Stack spacing="md">
          <Text fz="md" lh="md">
            {product.description || 'No description available'}
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
                <Table.Th w={160}>Description</Table.Th>
                <Table.Td>{product.description || 'None'}</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Th>Is Featured</Table.Th>
                <Table.Td>{product.isFeatured ? 'Yes' : 'No'}</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Th>Price Usd</Table.Th>
                <Table.Td>{product.priceUsd || 'None'}</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Th>Expires At</Table.Th>
                <Table.Td>
                  {product.expiresAt
                    ? formatDateTime(product.expiresAt)
                    : 'None'}
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Th>Selling Points</Table.Th>
                <Table.Td>
                  {product.sellingPoints.length > 0
                    ? product.sellingPoints.join(', ')
                    : 'None'}
                </Table.Td>
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
      </Paper>
    </>
  );
}
