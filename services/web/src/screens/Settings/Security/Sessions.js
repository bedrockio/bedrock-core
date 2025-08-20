import {
  ActionIcon,
  Badge,
  Button,
  Divider,
  Group,
  Stack,
  Table,
  Text,
} from '@mantine/core';

import { notifications } from '@mantine/notifications';
import { PiTrash } from 'react-icons/pi';

import { useSession } from 'stores/session';

import { getToken, useRequest } from 'utils/api';
import countries from 'utils/countries';
import { fromNow } from 'utils/date';
import { parseToken } from 'utils/token';
import { parseUserAgent } from 'utils/user-agent';

export default function Sessions() {
  const { user, bootstrap } = useSession();

  const { jti } = parseToken(getToken());

  const logoutRequest = useRequest({
    method: 'POST',
    path: '/1/auth/logout',
    onSuccess: () => {
      bootstrap();
    },
    onError: () => {
      notifications.show({
        position: 'top-right',
        title: 'Error',
        message: 'Failed to logout session(s)',
        color: 'red',
      });
    },
  });

  return (
    <Stack>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Device/Browser</Table.Th>
            <Table.Th>Country</Table.Th>
            <Table.Th>Last Used</Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {user.authTokens.map((token) => {
            const country = countries.find(
              (country) => country.countryCode === token.country,
            );

            const { device, os, browser } = parseUserAgent(token.userAgent);

            return (
              <Table.Tr key={token.jti}>
                <Table.Td>
                  <Group>
                    <Text
                      title={`Device: ${device}\nOS: ${os}\nBrowser: ${browser}`}
                      variant="default"
                      size="sm">
                      {[os, browser].join(' - ')}
                    </Text>

                    {token.jti === jti && (
                      <Badge size="sm" variant="outline">
                        Current
                      </Badge>
                    )}
                  </Group>
                </Table.Td>
                <Table.Td title={`IP: ${token.ip}`}>
                  {country?.nameEn || 'N/A'}
                </Table.Td>
                <Table.Td>{fromNow(token.lastUsedAt)}</Table.Td>
                <Table.Td>
                  <ActionIcon
                    title="Logout"
                    variant="transparent"
                    loading={logoutRequest.loading}
                    disabled={logoutRequest.loading}
                    onClick={() =>
                      logoutRequest.request({ body: { jti: token.jti } })
                    }>
                    <PiTrash color="red" />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
      <Divider />
      <Group>
        <Button
          color="red"
          loading={logoutRequest.loading}
          disabled={logoutRequest.loading}
          onClick={() => logoutRequest.request({ body: { all: true } })}>
          Logout All Sessions
        </Button>
      </Group>
    </Stack>
  );
}
