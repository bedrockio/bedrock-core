import { Group, Switch, Text, useMantineColorScheme } from '@mantine/core';
import { PiMoonFill, PiSunFill } from 'react-icons/pi';

import Logo from 'components/Logo';

export default function Footer() {
  const { setColorScheme, colorScheme } = useMantineColorScheme();
  return (
    <footer>
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
              <PiSunFill
                color="var(--mantine-color-yellow-4)"
                style={{ fontSize: '2em' }}
              />
            }
            offLabel={
              <PiMoonFill
                color="var(--mantine-color-blue-6)"
                style={{ fontSize: '2em' }}
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
