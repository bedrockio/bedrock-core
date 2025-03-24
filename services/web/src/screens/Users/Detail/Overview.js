import React from 'react';
import { usePage } from 'stores/page';
import {
  Paper,
  Group,
  Image,
  Stack,
  Text,
  Title,
  SimpleGrid,
} from '@mantine/core';

import Menu from './Menu';
import { urlForUpload } from 'utils/uploads';
import { formatDateTime } from 'utils/date';

export default function UserOverview() {
  const { user } = usePage();

  return (
    <>
      <Menu />
      <Paper shadow="md" p="xl" withBorder mt="md">
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          <Stack>
            <Title order={4}>User Details</Title>
            <Group>
              <Text fw={500}>Name:</Text>
              <Text>{user.name}</Text>
            </Group>
            <Group>
              <Text fw={500}>Email:</Text>
              <Text>{user.email}</Text>
            </Group>
            <Group>
              <Text fw={500}>Role:</Text>
              <Text>{user.role}</Text>
            </Group>
            <Group>
              <Text fw={500}>Created:</Text>
              <Text>{formatDateTime(user.createdAt)}</Text>
            </Group>
          </Stack>
          <Stack>
            {user.avatar && (
              <>
                <Title order={4}>Avatar</Title>
                <Image
                  radius="md"
                  h={200}
                  w="auto"
                  fit="contain"
                  src={urlForUpload(user.avatar)}
                />
              </>
            )}
            {user.address && user.address.line1 && (
              <>
                <Title order={4}>Address</Title>
                <Text>{user.address.line1}</Text>
                {user.address.line2 && <Text>{user.address.line2}</Text>}
                <Text>
                  {user.address.city}
                  {user.address.countryCode && `, ${user.address.countryCode}`}
                </Text>
              </>
            )}
          </Stack>
        </SimpleGrid>
      </Paper>
    </>
  );
}
