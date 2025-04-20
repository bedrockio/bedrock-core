import { NavLink } from '@bedrockio/router';
import { useSession } from 'stores/session';
import Logo from 'components/Logo';
import OrganizationSelector from 'components/OrganizationSelector';
import { userCanSwitchOrganizations } from 'utils/permissions';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';

import {
  IconApps,
  IconBook,
  IconBuildingStore,
  IconBuilding,
  IconMail,
  IconPackage,
  IconSettings,
  IconTerminal2,
  IconUsersGroup,
  IconListSearch,
  IconChevronDown,
} from '@tabler/icons-react';

import {
  AppShell,
  Burger,
  Flex,
  ScrollArea,
  Center,
  Button,
  Text,
  Affix,
} from '@mantine/core';

import MenuItem from '../components/MenuItem';
import ModalTrigger from 'components/ModalTrigger';
import Footer from 'components/Footer';

const menuItems = [
  {
    icon: IconBuildingStore,
    href: '/shops',
    label: 'Shops',
  },
  { icon: IconPackage, href: '/products', label: 'Products' },
  {
    icon: IconUsersGroup,
    label: 'People',
    items: [
      {
        icon: IconUsersGroup,
        label: 'Users',
        href: '/users',
      },
      {
        icon: IconMail,
        label: 'Invites',
        href: '/invites',
      },
    ],
  },
  { icon: IconBuilding, href: '/organizations', label: 'Organizations' },
];

const accountItems = [
  {
    icon: IconTerminal2,
    label: 'System',
    items: [
      {
        icon: IconListSearch,
        href: '/audit-log',
        label: 'Audit Log',
      },
      {
        icon: IconApps,
        href: '/applications',
        label: 'Applications',
      },
      {
        icon: IconBook,
        href: '/docs',
        label: 'API Docs',
        external: true,
      },
    ],
  },
  {
    icon: IconSettings,
    href: '/settings',
    label: 'My Settings',
  },
  {
    icon: IconMail,
    href: '/logout',
    label: 'Log Out',
  },
];

export default function DashboardLayout({ children }) {
  const { user, organization } = useSession();
  const [opened, { toggle }] = useDisclosure();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <AppShell
      header={{ height: 50, collapsed: !isMobile }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md">
      <AppShell.Header height="100%">
        <Flex
          h="50px"
          flex="row"
          gap="md"
          justify="flex-start"
          align="center"
          p="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Logo height={20} />
        </Flex>
      </AppShell.Header>
      <AppShell.Navbar>
        <AppShell.Section>
          <Center mt="xs">
            <NavLink to="/">
              <Logo m="xs" w="160px" />
            </NavLink>
          </Center>
          {userCanSwitchOrganizations(user) && (
            <ModalTrigger
              title="Select Organization"
              trigger={
                <Button
                  variant="default"
                  styles={{
                    section: {},
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
                  rightSection={<IconChevronDown size={16} stroke={1.5} />}
                  leftSection={<IconBuilding size={16} stroke={1.5} />}>
                  <Text size="sm">
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
        {children}
        <Footer />
      </AppShell.Main>
    </AppShell>
  );
}
