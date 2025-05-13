import { usePage } from 'stores/page';
import {
  Badge,
  Stack,
  Text,
  Box,
  SimpleGrid,
  Card,
  Divider,
  Anchor,
  Image,
  Group,
} from '@mantine/core';
import { Link } from '@bedrockio/router';

import Menu from './Menu';
import { formatDateTime } from 'utils/date';

import { formatRoles } from 'utils/permissions';
import { useRequest } from 'utils/api';
import { urlForUpload } from 'utils/uploads';

function LinkWrapped({ children, ...props }) {
  return (
    <Anchor component={Link} {...props}>
      {children}
    </Anchor>
  );
}

export default function UserOverview() {
  const { user } = usePage();

  const shopsRequest = useRequest({
    method: 'POST',
    path: '/1/shops/search',
    body: {
      owner: user.id,
      limit: 3,
    },
  });

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
          <Card.Section p="md" withBorder>
            <Text size="md" weight="bold">
              Shops
            </Text>
          </Card.Section>
          {shopsRequest.data.length === 0 && (
            <Text mt="md" size="xs" c="dimmed">
              No shops yet
            </Text>
          )}
          {shopsRequest.data.map((shop) => {
            return (
              <Card.Section
                component={LinkWrapped}
                to={`/shops/${shop.id}`}
                p="md"
                underline={false}
                key={shop.id}>
                <Group>
                  <Image
                    radius={4}
                    h={40}
                    w={40}
                    fit
                    src={urlForUpload(shop.images[0])}
                  />
                  <Stack gap={0}>
                    <Text weight="bold" color="primary" td="none">
                      {shop.name}
                    </Text>
                    <Text size="xs" c="dimmed" td="none">
                      {shop.description}
                    </Text>
                  </Stack>
                </Group>
              </Card.Section>
            );
          })}
        </Card>
      </SimpleGrid>
    </>
  );
}
