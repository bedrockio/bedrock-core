import { usePage } from 'stores/page';
import {
  Badge,
  Stack,
  Text,
  Box,
  SimpleGrid,
  Card,
  Divider,
} from '@mantine/core';

import Menu from './Menu';
import { formatDateTime } from 'utils/date';

import { formatRoles } from 'utils/permissions';

export default function UserOverview() {
  const { user } = usePage();

  return (
    <>
      <Menu />

      <SimpleGrid mt="md" cols={{ base: 1, md: 2 }} spacing="xl">
        <Card withBorder>
          <Stack spacing="xs">
            <Text size="md" weight="bold">
              User Information
            </Text>
            <Divider />

            <Box>
              <Text size="xs" c="dimmed">
                Name
              </Text>
              <Text>{user.name}</Text>
            </Box>

            <Box>
              <Text size="xs" c="dimmed">
                Email
              </Text>
              <Text>{user.email}</Text>
            </Box>

            <Box>
              <Text size="xs" c="dimmed">
                Roles
              </Text>
              <Box mt={3}>
                {formatRoles(user.roles).map((label) => {
                  return (
                    <Badge
                      size="md"
                      radius="md"
                      leftSection={<label.icon size={14} />}
                      key={label.key}>
                      {label.content}
                    </Badge>
                  );
                })}
              </Box>
            </Box>

            <Box>
              <Text size="xs" c="dimmed">
                Phone
              </Text>
              <Text>{user.phone || 'N / A'}</Text>
            </Box>

            <Box>
              <Text size="xs" c="dimmed">
                Created At
              </Text>
              <Text>{formatDateTime(user.createdAt)}</Text>
            </Box>
          </Stack>
        </Card>

        <Card withBorder>
          <Stack spacing="xs">
            <Text size="md" weight="bold">
              User Activity
            </Text>
            <Divider />
          </Stack>
        </Card>
      </SimpleGrid>
    </>
  );
}
