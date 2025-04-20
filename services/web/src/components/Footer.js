import Logo from 'components/Logo';

import { Group, Text } from '@mantine/core';

export default function Footer() {
  return (
    <footer>
      <Group gap={'xs'} justify="flex-start" align="center">
        <Text fw="bold" size="xs">
          Built with
        </Text>
        <Logo width="112" height="17" />
      </Group>
    </footer>
  );
}
