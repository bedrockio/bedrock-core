import React from 'react';
import { NavLink } from '@bedrockio/router';
import { Icon, Container } from 'semantic';

import { useSession } from 'stores/session';

import Logo from 'components/Logo';
import Footer from 'components/Footer';
import Layout from 'components/Layout';
import Protected from 'components/Protected';
import OrganizationSelector from 'components/OrganizationSelector';
import ConnectionError from 'components/ConnectionError';

import { userCanSwitchOrganizations } from 'utils/permissions';

import Sidebar from './Sidebar';

import favicon from 'assets/favicon.svg';

import { useDisclosure } from '@mantine/hooks';

import {
  IconBuildingStore,
  IconBulb,
  IconCheckbox,
  IconComponents,
  IconOutbound,
  IconPackage,
  IconPlus,
  IconSearch,
  IconUser,
  IconUsersGroup,
} from '@tabler/icons-react';

import { AppShell, Burger, Flex, TextInput, Stack } from '@mantine/core';

import { useMediaQuery } from '@mantine/hooks';

import { LinksGroup } from './components/LinksGroup';
import ModalTrigger from 'components/ModalTrigger';

const links = [
  { icon: IconBuildingStore, href: '/shops', label: 'Shops' },
  { icon: IconPackage, href: '/products', label: 'Products' },
  {
    icon: IconUsersGroup,
    label: 'Accounts',
    links: [
      {
        icon: IconUsersGroup,
        label: 'Users',
        href: '/users',
      },
      {
        icon: IconOutbound,
        label: 'Invites',
        href: '/users/invites',
      },
    ],
  },
  { icon: IconComponents, href: '/organizations', label: 'Organizations' },
];

export default function DashboardLayout({ children }) {
  const { user, organization } = useSession();
  const [opened, { toggle }] = useDisclosure();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const mainLinks = links.map((link) => (
    <LinksGroup
      href={link.href}
      key={link.label}
      icon={link.icon}
      label={link.label}
      links={link.links}
    />
  ));
  /*
  <UnstyledButton key={link.label} className={classes.mainLink}>
      <div className={classes.mainLinkInner}>
        <link.icon size={20} className={classes.mainLinkIcon} stroke={1.5} />
        <span>{link.label}</span>
      </div>
    </UnstyledButton>
    */

  return (
    <AppShell
      header={{ height: 50, collapsed: !isMobile }}
      navbar={{ width: 350, breakpoint: 'sm', collapsed: { mobile: !opened } }}
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
      <AppShell.Navbar p="md">
        <Stack gap="md">
          <NavLink to="/">
            <Logo mb="md" w="160px" />
          </NavLink>
          {userCanSwitchOrganizations(user) && (
            <ModalTrigger
              title="Select Organization"
              trigger={
                <TextInput
                  m={0}
                  placeholder={organization?.name || 'Select Organization'}
                  leftSection={<IconBuildingStore size={14} />}
                  rightSection={<IconPlus size={14} />}
                />
              }>
              <OrganizationSelector />
            </ModalTrigger>
          )}

          <div>{mainLinks}</div>
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
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

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
