import { Group, Paper, Stack } from '@mantine/core';

import ConnectionError from 'components/ConnectionError';
import Logo from 'components/Logo';

export default function BasicLayout({ children }) {
  return (
    <div
      style={{
        height: '100vh',
        background: 'light-dark(var(--mantine-color-brown-0), transparent)',
      }}>
      <ConnectionError />
      <Group justify="center" align="center" pt={{ base: 30, sm: 120 }}>
        <Stack w={{ base: '100%', sm: 480 }} align="center">
          <Logo maw={200} title="Login" />
          <Paper mt="md" w="100%" p="lg" radius="md" withBorder>
            {children}
          </Paper>
        </Stack>
      </Group>
    </div>
  );
}
