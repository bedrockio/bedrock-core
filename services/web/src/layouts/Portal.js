import { Link, useLocation } from '@bedrockio/router';

import {
  AppShell,
  Flex,
  Button,
  ScrollArea,
  Burger,
  Group,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import Logo from 'components/Logo';
import ConnectionError from 'components/ConnectionError';

import { IconArrowBack } from '@tabler/icons-react';
import MenuItem from 'components/MenuItem';
import { useEffect } from 'react';

export default function PortalLayout({ children, menuItems, actions }) {
  const [opened, { toggle, close }] = useDisclosure();

  const location = useLocation();

  useEffect(() => {
    close();
  }, [location.pathname]);

  return (
    <>
      <AppShell
        header={{ height: 50 }}
        navbar={{
          width: 220,
          breakpoint: 'sm',
          collapsed: { mobile: !opened },
        }}
        styles={{
          navbar: {
            //backgroundColor: 'var(--mantine-color-gray-0)',
          },
        }}
        padding="md">
        <AppShell.Header height="100%">
          <Flex
            h="50px"
            flex="row"
            gap="md"
            justify="space-between"
            align="center"
            p="md">
            <Group>
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
              />
              <Logo height={20} />
            </Group>
            <Button
              size="compact-sm"
              component={Link}
              to="/"
              rightSection={<IconArrowBack size={14} />}>
              Go to Dashboard
            </Button>
          </Flex>
        </AppShell.Header>
        <AppShell.Navbar>
          <AppShell.Section component={ScrollArea} grow>
            {menuItems.map((item) => (
              <MenuItem key={item.id} {...item} />
            ))}
          </AppShell.Section>
          <AppShell.Section>{actions}</AppShell.Section>
        </AppShell.Navbar>
        <AppShell.Main>
          <ConnectionError />
          {children}
        </AppShell.Main>
      </AppShell>
    </>
  );
}
