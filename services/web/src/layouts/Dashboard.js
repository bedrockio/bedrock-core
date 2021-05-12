import React from 'react';
import { withSession } from 'stores';
import { NavLink } from 'react-router-dom';
import { Menu, Icon, Container } from 'semantic';
import Header from 'components/Header';
import Footer from 'components/Footer';
import { Layout } from 'components';
import Protected from 'components/Protected';
import Sidebar from './Sidebar';

import logo from 'assets/bedrock.svg';
import { SidebarPusher } from 'semantic-ui-react';

@withSession
export default class DashboardLayout extends React.Component {
  render() {
    return (
      <Sidebar>
        <Sidebar.Menu>
          <Layout style={{ height:'100%' }}>
            <Sidebar.Item as={NavLink} className="logo" to="/">
              <img style={{ height: '30px' }} src={logo} />
            </Sidebar.Item>
            <Layout vertical top style={{ justifyContent:'space-between', overflow:'hidden' }}>
              <Menu secondary vertical style={{ overflowY:'auto', margin:'0.5em 0 0 0' }}>
                <Menu.Header>
                  Items
                </Menu.Header>
                <Menu.Item as={NavLink} to="/shops">
                  <Icon name="store"/>Shops
                </Menu.Item>

                <Protected endpoint="events">
                  <Menu.Item as={NavLink} to="/users">
                    <Icon name="users"/>Users
                  </Menu.Item>
                </Protected>

                <Protected endpoint="events">
                  <Menu.Item as={NavLink} to="/invites">
                    <Icon name="envelope"/>Invites
                  </Menu.Item>
                </Protected>
              </Menu>

              <Layout style={{ flex:'0 0 auto', paddingTop:'0.5em', borderTop:'1px solid #ccc' }}>
              <Menu secondary vertical>
                <Menu.Item as={NavLink} to="/docs/getting-started">
                  <Icon name="terminal"/>Docs
                </Menu.Item>
                <Menu.Item as={NavLink} to="/settings">
                  <Icon name="cog"/>Settings
                </Menu.Item>
                <Menu.Item as={NavLink} to="/logout">
                  <Icon name="sign-out-alt"/>Log Out
                </Menu.Item>
              </Menu>
              </Layout>
            </Layout>
          </Layout>
        </Sidebar.Menu>
        <Sidebar.Content>
          <Container>
            <Header />
            <main>{this.props.children}</main>
            <Footer />
          </Container>
        </Sidebar.Content>
      </Sidebar>
    );
  }
}
