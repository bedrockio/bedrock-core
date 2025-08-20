import { useEffect } from 'react';
import { useLocation } from '@bedrockio/router';
import { NavLink } from '@bedrockio/router';
import { useSession } from 'stores/session';
import Logo from 'components/Logo';
import OrganizationSelector from 'components/OrganizationSelector';
import { userCanSwitchOrganizations } from 'utils/permissions';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';

import ConnectionError from 'components/ConnectionError';
import ErrorBoundary from 'components/ErrorBoundary';
import {
  PiBookFill,
  PiBuildingOfficeFill,
  PiDoorFill,
  PiEnvelopeSimpleFill,
  PiGearFill,
  PiGridFourFill,
  PiListMagnifyingGlass,
  PiStorefrontFill,
  PiTagFill,
  PiTerminalFill,
  PiUserFill,
  PiFileFill,
} from 'react-icons/pi';
import { TbChevronDown } from 'react-icons/tb';

import {
  AppShell,
  Burger,
  Flex,
  ScrollArea,
  Center,
  Button,
  Text,
  Box,
} from '@mantine/core';

import MenuItem from '../components/MenuItem';
import ModalTrigger from 'components/ModalWrapper';
import Footer from 'components/Footer';

const menuItems = [
  {
    icon: PiStorefrontFill,
    url: '/shops',
    label: 'Shops',
  },
  {
    icon: PiTagFill,
    url: '/products',
    label: 'Products',
  },
  {
    icon: PiUserFill,
    label: 'Users',
    url: '/users',
    items: [
      {
        icon: PiEnvelopeSimpleFill,
        label: 'Invites',
        url: '/users/invites',
      },
    ],
  },
  {
    icon: PiBuildingOfficeFill,
    url: '/organizations',
    label: 'Organizations',
  },
];

const accountItems = [
  {
    icon: PiTerminalFill,
    label: 'System',
    items: [
      {
        icon: PiFileFill,
        url: '/templates',
        label: 'Templates',
      },
      {
        icon: PiListMagnifyingGlass,
        url: '/audit-log',
        label: 'Audit Log',
      },
      {
        icon: PiGridFourFill,
        url: '/applications',
        label: 'Applications',
      },
      {
        icon: PiBookFill,
        url: '/docs',
        label: 'API Docs',
      },
    ],
  },
  {
    icon: PiGearFill,
    url: '/settings',
    label: 'My Settings',
  },
  {
    icon: PiDoorFill,
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
        breakpoint: 'sm',
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
                  leftSection={<PiBuildingOfficeFill />}>
                  <Text size="sm" fw="500">
                    {organization?.name || 'Select Organization'}
                  </Text>
                </Button>
              }>
              <OrganizationSelector />
            </ModalTrigger>
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
