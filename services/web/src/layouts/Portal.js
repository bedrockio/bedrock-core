import { Link, useLocation } from '@bedrockio/router';

import {
  AppShell,
  Burger,
  Button,
  Flex,
  Group,
  ScrollArea,
} from '@mantine/core';

import { useDisclosure } from '@mantine/hooks';
import { useEffect } from 'react';

import ConnectionError from 'components/ConnectionError';
import Logo from 'components/Logo';
import MenuItem from 'components/MenuItem';

export default function PortalLayout({ children, menuItems, actions }) {
  const [opened, { toggle, close }] = useDisclosure();

  const location = useLocation();

  useEffect(() => {
    close();
  }, [location.pathname]);

  return (
    <>
      <AppShell
        header={{ height: 75 }}
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
            h="75px"
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
              <Logo height={35} />
            </Group>
            <Button size="compact-sm" component={Link} to="/">
              Go to Dashboard
            </Button>
          </Flex>
        </AppShell.Header>
        <AppShell.Navbar>
          <AppShell.Section component={ScrollArea} grow>
            {menuItems.map((item) => (
              <MenuItem compact key={item.id} {...item} />
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
