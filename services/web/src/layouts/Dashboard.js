import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon, Container } from 'semantic';
import Footer from 'components/Footer';
import { Layout } from 'components';
import Protected from 'components/Protected';
import Organization from 'modals/Organization';
import Sidebar from './Sidebar';

import logo from 'assets/logo.svg';
import favicon from 'assets/favicon.svg';

export default class DashboardLayout extends React.Component {
  render() {
    return (
      <Sidebar>
        <Sidebar.Menu>
          <Layout style={{ height: '100%' }}>
            <NavLink style={{ margin: '5px 25px 15px 25px' }} to="/">
              <img height="30" src={logo} />
            </NavLink>
            <Layout vertical spread>
              <Sidebar.Item>
                <Organization
                  trigger={
                    <div>
                      <Icon name="building" />
                      Bedrock Inc.
                      <Icon name="caret-down" className="right" />
                    </div>
                  }
                  size="tiny"
                />
              </Sidebar.Item>
              <Layout.Group>
                <Sidebar.Header>Main Menu</Sidebar.Header>
              </Layout.Group>
              <Layout.Group grow overflow>
                <Sidebar.Link to="/shops">
                  <Icon name="store" />
                  Shops
                </Sidebar.Link>
                <Protected endpoint="users">
                  <Sidebar.Link to="/users">
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
              </Layout.Group>
              <Layout.Group>
                <Sidebar.Divider />
                <Sidebar.Link to="/settings">
                  <Icon name="cog" />
                  Settings
                </Sidebar.Link>
                <Sidebar.Link to="/docs/getting-started">
                  <Icon name="terminal" />
                  Docs
                </Sidebar.Link>
                <Sidebar.Link to="/logout">
                  <Icon name="sign-out-alt" />
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
