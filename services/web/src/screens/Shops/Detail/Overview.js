import React from 'react';
import { Table, Title, Image, Stack, Group, Paper, Text } from '@mantine/core';

import { usePage } from 'stores/page';
import Meta from 'components/Meta';

import { arrayToList, formatAddress } from 'utils/formatting';

import { formatDateTime } from 'utils/date';
import { urlForUpload } from 'utils/uploads';

import Menu from './Menu';

export default function ShopOverview() {
  const { shop } = usePage();
  return (
    <>
      <Meta title={shop.name} />
      <Menu />
      <Paper shadow="md" p="md" withBorder>
        <Stack spacing="md">
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
                <Table.Td>{arrayToList(shop.categories)}</Table.Td>
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
      </Paper>
    </>
  );
}
