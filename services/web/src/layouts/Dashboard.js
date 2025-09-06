import { NavLink, useLocation } from '@bedrockio/router';

import {
  AppShell,
  Box,
  Burger,
  Button,
  Center,
  Divider,
  Flex,
  ScrollArea,
  Text,
} from '@mantine/core';

import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import React, { useEffect } from 'react';

import {
  PiBookBold,
  PiBuildingOfficeBold,
  PiDoorBold,
  PiEnvelopeSimpleBold,
  PiFileBold,
  PiGearBold,
  PiGridFourBold,
  PiListMagnifyingGlass,
  PiStorefrontBold,
  PiTagBold,
  PiTerminalBold,
  PiUserBold,
} from 'react-icons/pi';

import { TbChevronDown } from 'react-icons/tb';

import { useSession } from 'stores/session';

import ConnectionError from 'components/ConnectionError';
import ErrorBoundary from 'components/ErrorBoundary';
import Footer from 'components/Footer';
import Logo from 'components/Logo';
import ModalTrigger from 'components/ModalWrapper';
import OrganizationSelector from 'components/OrganizationSelector';

import { userCanSwitchOrganizations } from 'utils/permissions';

import MenuItem from '../components/MenuItem';

const menuItems = [
  {
    icon: PiStorefrontBold,
    url: '/shops',
    label: 'Shops',
  },
  {
    icon: PiTagBold,
    url: '/products',
    label: 'Products',
  },
  {
    icon: PiUserBold,
    label: 'Users',
    url: '/users',
    items: [
      {
        icon: PiEnvelopeSimpleBold,
        label: 'Invites',
        url: '/users/invites',
      },
    ],
  },
  {
    icon: PiBuildingOfficeBold,
    url: '/organizations',
    label: 'Organizations',
  },
];

const accountItems = [
  {
    icon: PiTerminalBold,
    label: 'System',
    items: [
      {
        icon: PiFileBold,
        url: '/templates',
        label: 'Templates',
      },
      {
        icon: PiListMagnifyingGlass,
        url: '/audit-log',
        label: 'Audit Log',
      },
      {
        icon: PiGridFourBold,
        url: '/applications',
        label: 'Applications',
      },
      {
        icon: PiBookBold,
        url: '/docs',
        label: 'API Docs',
      },
    ],
  },
  {
    icon: PiGearBold,
    url: '/settings',
    label: 'My Settings',
  },
  {
    icon: PiDoorBold,
    url: '/logout',
    label: 'Log Out',
  },
];

export default function DashboardLayout({ children }) {
  const { user, organization } = useSession();
  const [opened, { toggle, close }] = useDisclosure();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const location = useLocation();

  useEffect(() => {
    close();
  }, [location.pathname]);

  return (
    <AppShell
      header={{ height: 50, collapsed: !isMobile }}
      navbar={{
        width: 260,
        breakpoint: 'md',
        collapsed: { mobile: !opened },
      }}
      padding="lg">
      <AppShell.Header height="100%">
        <Flex
          h="50px"
          flex="row"
          gap="md"
          justify="flex-start"
          align="center"
          p="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <div>
            <Logo height={20} />
          </div>
        </Flex>
      </AppShell.Header>
      <AppShell.Navbar>
        <AppShell.Section>
          <Center mt="xs">
            <NavLink to="/">
              <Logo h="50px" p="4px" />
            </NavLink>
          </Center>
          {userCanSwitchOrganizations(user) && (
            <React.Fragment>
              <ModalTrigger
                title="Select Organization"
                trigger={
                  <Button
                    variant="default"
                    styles={{
                      root: {
                        border: 'none',
                      },
                      label: {
                        flex: 1,
                      },
                    }}
                    style={{
                      background: 'transparent',
                      width: 'calc(100% - 16px)',
                    }}
                    fullWidth
                    m="xs"
                    justify="flex-start"
                    rightSection={<TbChevronDown />}
                    leftSection={<PiBuildingOfficeBold />}>
                    <Text size="sm" fw="500">
                      {organization?.name || 'Select Organization'}
                    </Text>
                  </Button>
                }>
                <OrganizationSelector />
              </ModalTrigger>
              <Divider />
            </React.Fragment>
          )}
        </AppShell.Section>
        <AppShell.Section grow component={ScrollArea}>
          {menuItems.map((item) => (
            <MenuItem key={item.label} {...item} />
          ))}
        </AppShell.Section>
        <AppShell.Section>
          {accountItems.map((item) => (
            <MenuItem key={item.label} {...item} />
          ))}
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main>
        <Box style={{ flex: 1 }}>
          <ConnectionError />
          <ErrorBoundary>{children}</ErrorBoundary>
        </Box>
        <Footer />
      </AppShell.Main>
    </AppShell>
  );
}
