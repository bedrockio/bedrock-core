import Logo from 'components/Logo';

import { Group, Switch, Text, useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoonStars } from '@tabler/icons-react';

export default function Footer() {
  const { setColorScheme, colorScheme } = useMantineColorScheme();
  return (
    <footer
      style={{
        position: 'absolute',
        right: '10px',
      }}>
      <Group p="md" gap="md" justify="flex-end" align="center">
        <Group gap="xs">
          <Text fw="bold" size="xs" color="dimmed">
            Theme
          </Text>
          <Switch
            checked={colorScheme === 'dark'}
            onChange={() =>
              setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')
            }
            size="md"
            color="dark.4"
            onLabel={
              <IconSun
                size={16}
                stroke={2.5}
                color="var(--mantine-color-yellow-4)"
              />
            }
            offLabel={
              <IconMoonStars
                size={16}
                stroke={2.5}
                color="var(--mantine-color-blue-6)"
              />
            }
          />
        </Group>
        <Group gap="xs">
          <Text fw="bold" size="xs" color="dimmed">
            Built with
          </Text>
          <div>
            <Logo width="120" height="18" />
          </div>
        </Group>
      </Group>
    </footer>
  );
}
