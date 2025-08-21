import { Stack, Table, Text } from '@mantine/core';

import { usePage } from 'stores/page';

import { formatDateTime } from 'utils/date';

import Menu from './Menu';

export default function ShopOverview() {
  const { organization } = usePage();
  return (
    <>
      <Menu />

      <Stack mt="md" spacing="md">
        <Text fz="md" lh="md">
          {organization.name}
        </Text>
        <Table mt="md" variant="vertical" layout="fixed" withTableBorder>
          <Table.Tbody>
            <Table.Tr>
              <Table.Th>Created At</Table.Th>
              <Table.Td>{formatDateTime(organization.createdAt)}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Updated At</Table.Th>
              <Table.Td>{formatDateTime(organization.updatedAt)}</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Stack>
    </>
  );
}
