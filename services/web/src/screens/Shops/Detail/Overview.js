import { Group, Image, Stack, Table, Text, Title } from '@mantine/core';

import { usePage } from 'stores/page';

import { formatDateTime } from 'utils/date';
import { arrayToList, formatAddress } from 'utils/formatting';
import { urlForUpload } from 'utils/uploads';

import Menu from './Menu';

export default function ShopOverview() {
  const { shop } = usePage();
  return (
    <>
      <Menu />

      <Stack mt="md" spacing="md">
        <Text fz="md" lh="md">
          {shop.description}
        </Text>
        <Title order={4}>Images</Title>
        <Group>
          {shop.images.map((image) => (
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
              <Table.Th w={160}>Categories</Table.Th>
              <Table.Td>
                <ul>
                  {shop.categories.map((category) => {
                    return <li key={category.id}>{category.name}</li>;
                  })}
                </ul>
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Address</Table.Th>
              <Table.Td>{formatAddress(shop.address)}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Created At</Table.Th>
              <Table.Td>{formatDateTime(shop.createdAt)}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Updated At</Table.Th>
              <Table.Td>{formatDateTime(shop.updatedAt)}</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Stack>
    </>
  );
}
