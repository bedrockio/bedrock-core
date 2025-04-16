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
  IconComponents,
  IconMail,
  IconPackage,
  IconPlus,
  IconSettings,
  IconTerminal2,
  IconUsersGroup,
} from '@tabler/icons-react';

import {
  AppShell,
  Burger,
  Flex,
  TextInput,
  ScrollArea,
  Center,
} from '@mantine/core';

import MenuItem from '../components/MenuItem';
import ModalTrigger from 'components/ModalTrigger';

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
  { icon: IconComponents, href: '/organizations', label: 'Organizations' },
];

const accountItems = [
  {
    icon: IconTerminal2,
    label: 'System',
    items: [
      {
        icon: IconApps,
        href: '/applications',
        label: 'Applications',
      },
      {
        icon: IconBook,
        href: '/docs',
        label: 'API Docs',
      },
      {
        icon: IconMail,
        href: '/audit-log',
        label: 'Audit Log',
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
                <TextInput
                  p="xs"
                  m={0}
                  placeholder={organization?.name || 'Select Organization'}
                  leftSection={<IconBuildingStore size={14} />}
                  rightSection={<IconPlus size={14} />}
                />
              }>
              <OrganizationSelector />
            </ModalTrigger>
          )}
        </AppShell.Section>
        <AppShell.Section grow component={ScrollArea}>
          {menuItems.map((item) => (
            <MenuItem key={item.href} {...item} />
          ))}
        </AppShell.Section>
        <AppShell.Section>
          {accountItems.map((item) => {
            return <MenuItem key={item.href} {...item} />;
          })}
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
