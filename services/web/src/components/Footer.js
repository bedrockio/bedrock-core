import Logo from 'components/Logo';

import { Group, Text } from '@mantine/core';

export default function Footer() {
  return (
    <footer
      style={{
        position: 'absolute',
        right: 0,
      }}>
      <Group pb="xs" pr="md" gap={'xs'} justify="flex-end" align="center">
        <Text fw="bold" size="xs">
          Built with
        </Text>
        <Logo width="112" height="17" />
      </Group>
    </footer>
  );
}
