import { Table, Stack, Group, Badge } from '@mantine/core';

import { usePage } from 'stores/page';

import { formatDateTime } from 'utils/date';

import Menu from './Menu';

export default function TemplateOverview() {
  const { template } = usePage();
  return (
    <>
      <Menu />

      <Stack mt="md" spacing="md">
        <Table mt="md" variant="vertical" layout="fixed" withTableBorder>
          <Table.Tbody>
            <Table.Tr>
              <Table.Th w={160}>Channels</Table.Th>
              <Table.Td>
                <Group gap="xs">
                  {template.channels.map((channel) => {
                    return <Badge key={channel}>{channel}</Badge>;
                  })}
                </Group>
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Created At</Table.Th>
              <Table.Td>{formatDateTime(template.createdAt)}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Updated At</Table.Th>
              <Table.Td>{formatDateTime(template.updatedAt)}</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Stack>
    </>
  );
}
