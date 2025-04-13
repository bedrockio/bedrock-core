import { NavLink } from '@bedrockio/router';
import { useSession } from 'stores/session';
import Logo from 'components/Logo';
import OrganizationSelector from 'components/OrganizationSelector';
import { userCanSwitchOrganizations } from 'utils/permissions';
import { useDisclosure } from '@mantine/hooks';

import {
  IconApps,
  IconBook,
  IconBuildingStore,
  IconComponents,
  IconMail,
  IconPackage,
  IconPlus,
  IconSettings,
  IconUsersGroup,
} from '@tabler/icons-react';

import { AppShell, Burger, Flex, TextInput, ScrollArea } from '@mantine/core';

import { useMediaQuery } from '@mantine/hooks';

import { LinksGroup } from './components/LinksGroup';
import ModalTrigger from 'components/ModalTrigger';

const menuItems = [
  { icon: IconBuildingStore, href: '/shops', label: 'Shops' },
  { icon: IconPackage, href: '/products', label: 'Products' },
  {
    icon: IconUsersGroup,
    label: 'People',
    links: [
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
    icon: IconSettings,
    href: '/settings',
    label: 'Settings',
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
          <NavLink to="/">
            <Logo m="xs" w="160px" />
          </NavLink>
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
          {menuItems.map((link) => (
            <LinksGroup
              href={link.href}
              key={link.label}
              icon={link.icon}
              label={link.label}
              links={link.links}
            />
          ))}
        </AppShell.Section>
        <AppShell.Section>
          {accountItems.map((link) => {
            return (
              <LinksGroup
                href={link.href}
                key={link.label}
                icon={link.icon}
                label={link.label}
              />
            );
          })}
        </AppShell.Section>

        {/*
        <Stack gap="md">
          <Sidebar.Link to="/settings">
            <Icon name="gear" />
            Settings
          </Sidebar.Link>
          <Protected endpoint="applications">
            <Sidebar.Link to="/audit-trail">
              <Icon name="list-ol" />
              Audit Trail
            </Sidebar.Link>
            <Sidebar.Link to="/applications">
              <Icon name="terminal" />
              Applications
            </Sidebar.Link>
            <Sidebar.Accordion active="/applications">
              <Sidebar.Link to="/docs">
                <Icon name="book-open" />
                API Docs
              </Sidebar.Link>
            </Sidebar.Accordion>
            <Sidebar.Link to="/logout">
              <Icon name="right-from-bracket" />
              Log Out
            </Sidebar.Link>
          </Protected>
        </Stack>
        */}
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

/*
class DashboardLayoutOld extends React.Component {
  render() {
    const { user, organization } = this.context;
    return (
      <Sidebar>
        <ConnectionError />
        <Sidebar.Menu>
          <Layout style={{ height: '100%' }}>
            <NavLink style={{ margin: '5px 25px 20px 25px' }} to="/">
              <Logo width="100%" />
            </NavLink>
            <Layout vertical spread>
              <Layout.Group>
                <Sidebar.Header>Main Menu</Sidebar.Header>
              </Layout.Group>
              <Layout.Group grow overflow>
                <Sidebar.Link to="/shops">
                  <Icon name="store" />
                  Shops
                </Sidebar.Link>
                <Sidebar.Link to="/products">
                  <Icon name="box" />
                  Products
                </Sidebar.Link>
                <Protected endpoint="users">
                  <Sidebar.Link to="/users" exact>
                    <Icon name="users" />
                    Users
                  </Sidebar.Link>
                  <Sidebar.Accordion active="/users">
                    <Sidebar.Link to="/users/invites">
                      <Icon name="envelope" />
                      Invites
                    </Sidebar.Link>
                  </Sidebar.Accordion>
                </Protected>
                <Protected endpoint="organizations">
                  <Sidebar.Link to="/organizations">
                    <Icon name="building" />
                    Organizations
                  </Sidebar.Link>
                </Protected>
              </Layout.Group>
              <Layout.Group>
                <Sidebar.Divider />
                <Sidebar.Link to="/settings">
                  <Icon name="gear" />
                  Settings
                </Sidebar.Link>
                <Protected endpoint="applications">
                  <Sidebar.Link to="/audit-trail">
                    <Icon name="list-ol" />
                    Audit Trail
                  </Sidebar.Link>
                  <Sidebar.Link to="/applications">
                    <Icon name="terminal" />
                    Applications
                  </Sidebar.Link>
                  <Sidebar.Accordion active="/applications">
                    <Sidebar.Link to="/docs">
                      <Icon name="book-open" />
                      API Docs
                    </Sidebar.Link>
                  </Sidebar.Accordion>
                </Protected>
                <Sidebar.Link to="/logout">
                  <Icon name="right-from-bracket" />
                  Log Out
                </Sidebar.Link>
              </Layout.Group>
            </Layout>
          </Layout>
        </Sidebar.Menu>
        <Sidebar.Content>
          <Sidebar.Mobile>
            <Layout horizontal spread center>
              <Layout.Group>
                <NavLink to="/">
                  <img src={favicon} height="15" />
                </NavLink>
              </Layout.Group>
              <Layout.Group>
                <Sidebar.Trigger>
                  <Icon name="bars" fitted />
                </Sidebar.Trigger>
              </Layout.Group>
            </Layout>
          </Sidebar.Mobile>
          <Container>
            <main>{this.props.children}</main>
            <Footer />
          </Container>
        </Sidebar.Content>
      </Sidebar>
    );
  }
}
*/
