import { Link } from '@bedrockio/router';

import { Anchor, Text, Stack, Paper, Divider, Table } from '@mantine/core';
import { formatDateTime } from 'utils/date';

import Code from 'components/Code';

export default function Overview({ auditEntry }) {
  if (!auditEntry) {
    return null;
  }

  return (
    <Stack>
      <div>
        <Text size="sm" fw="bold">
          Details
        </Text>
        <Table variant="vertical" layout="fixed" withTableBorder>
          <Table.Tbody>
            <Table.Tr>
              <Table.Th w={120}>Activity</Table.Th>
              <Table.Td>{auditEntry.activity}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th w={120}>Actor</Table.Th>
              <Table.Td>
                <Link
                  title={auditEntry.actor.email}
                  to={`/users/${auditEntry.actor.id}`}>
                  {auditEntry.actor.firstName} {auditEntry.actor.lastName}
                </Link>
              </Table.Td>
            </Table.Tr>
            {auditEntry.objectType && (
              <Table.Tr>
                <Table.Th w={120}>Object Type</Table.Th>
                <Table.Td>{auditEntry.objectType}</Table.Td>
              </Table.Tr>
            )}
            {auditEntry.objectId && (
              <Table.Tr>
                <Table.Th w={120}>Object Id</Table.Th>
                <Table.Td>{auditEntry.objectId}</Table.Td>
              </Table.Tr>
            )}
            {auditEntry?.owner?.name && (
              <Table.Tr>
                <Table.Th w={120}>Object Owner</Table.Th>
                <Table.Td>
                  <Anchor
                    size="sm"
                    component={Link}
                    title={auditEntry.owner.name}
                    to={`/users/${auditEntry.owner.id}`}>
                    {auditEntry.owner.name}
                  </Anchor>{' '}
                  - {auditEntry.ownerType}
                </Table.Td>
              </Table.Tr>
            )}
            <Table.Tr>
              <Table.Th w={120}>Method</Table.Th>
              <Table.Td>{auditEntry.requestMethod}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th w={120}>Path</Table.Th>
              <Table.Td>{auditEntry.requestUrl}</Table.Td>
            </Table.Tr>
            {auditEntry.sessionId && (
              <Table.Tr>
                <Table.Th w={120}> Session Id</Table.Th>
                <Table.Td>{auditEntry.sessionId}</Table.Td>
              </Table.Tr>
            )}
            <Table.Tr>
              <Table.Th w={120}>Created At</Table.Th>
              <Table.Td>{formatDateTime(auditEntry.createdAt)}</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </div>

      {auditEntry.attributes && (
        <>
          <Divider />
          <Paper>
            <Text size="sm" fw="bold">
              Attributes
            </Text>
            <Code language="json">
              {JSON.stringify(auditEntry.attributes || {}, null, 2)}
            </Code>
          </Paper>
        </>
      )}

      {auditEntry.objectBefore && (
        <>
          <Divider />
          <Paper>
            <Text size="sm" fw="bold">
              Before
            </Text>
            <Code language="json">
              {JSON.stringify(auditEntry.objectBefore || {}, null, 2)}
            </Code>
          </Paper>
        </>
      )}
      {auditEntry.objectAfter && (
        <>
          <Divider />
          <Paper>
            <Text size="sm" fw="bold">
              After
            </Text>
            <Code fullWith language="json">
              {JSON.stringify(auditEntry.objectAfter || {}, null, 2)}
            </Code>
          </Paper>
        </>
      )}
    </Stack>
  );
}
