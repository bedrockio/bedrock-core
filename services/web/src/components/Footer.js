import Logo from 'components/Logo';

import { Group, SegmentedControl, Text, Center } from '@mantine/core';
import { IconSun, IconMoon, IconAutomation } from '@tabler/icons-react';

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
