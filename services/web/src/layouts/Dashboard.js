import React from 'react';
import { NavLink } from '@bedrockio/router';
import { Icon, Container } from 'semantic';

import { withSession } from 'stores/session';

import Logo from 'components/Logo';
import Footer from 'components/Footer';
import Layout from 'components/Layout';
import Protected from 'components/Protected';
import Organization from 'modals/OrganizationSelector';
import ConnectionError from 'components/ConnectionError';

import { userCanSwitchOrganizations } from 'utils/permissions';

import Sidebar from './Sidebar';

import favicon from 'assets/favicon.svg';

class DashboardLayout extends React.Component {
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
              {userCanSwitchOrganizations(user) && (
                <Sidebar.Item>
                  <Organization
                    trigger={
                      <div>
                        <Icon name="building" />
                        {organization?.name || 'Select Organization'}
                        <Icon name="caret-down" className="right" />
                      </div>
                    }
                    size="tiny"
                  />
                </Sidebar.Item>
              )}
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

export default withSession(DashboardLayout);
