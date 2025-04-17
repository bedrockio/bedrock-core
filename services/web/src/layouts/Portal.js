import { Link } from '@bedrockio/router';

import { AppShell, Flex, Button, ScrollArea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { useClass } from 'helpers/bem';

import Logo from 'components/Logo';
import ConnectionError from 'components/ConnectionError';

import './portal.less';
import { IconArrowBack } from '@tabler/icons-react';
import MenuItem from 'components/MenuItem';

export default function PortalLayout({ children, menuItems, actions }) {
  const { className, getElementClass } = useClass('portal-layout');
  const [opened, { toggle }] = useDisclosure();

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
            backgroundColor: 'var(--mantine-color-gray-0)',
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
            <Logo height={20} />
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
