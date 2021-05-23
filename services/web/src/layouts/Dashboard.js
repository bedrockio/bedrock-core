import React from 'react';
import { withSession } from 'stores';
import { NavLink } from 'react-router-dom';
import { Menu, Icon, Container, Accordion } from 'semantic';
import Footer from 'components/Footer';
import { Layout } from 'components';
import Protected from 'components/Protected';
import Sidebar from './Sidebar';

import logo from 'assets/bedrock.svg';
import favicon from 'assets/favicon.svg';

@withSession
export default class DashboardLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: null,
    };
  }

  onClick = (evt, { index }) => {
    this.setState({
      activeIndex: index,
    });
  };

  render() {
    const { activeIndex } = this.state;
    return (
      <Sidebar>
        <Sidebar.Menu>
          <Layout style={{ height: '100%' }}>
            <NavLink style={{ padding: '15px 0' }} to="/">
              <img height="30" src={logo} />
            </NavLink>
            <Layout vertical spread>
              <Layout.Group>
                <Sidebar.Header>Main Menu</Sidebar.Header>
                <Sidebar.Link to="/shops">
                  <Icon name="store" />
                  Shops
                </Sidebar.Link>
                <Protected endpoint="users">
                  <Accordion as={Menu} secondary vertical fluid>
                    <Accordion.Title
                      active={activeIndex === 0}
                      index={0}
                      onClick={this.onClick}>
                      <Sidebar.Link to="/users">
                        <Icon name="users" />
                        Users
                      </Sidebar.Link>
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === 0}>
                      <Sidebar.Link to="/invites">Invites</Sidebar.Link>
                    </Accordion.Content>
                  </Accordion>
                </Protected>
              </Layout.Group>
              <Layout.Group>
                <Sidebar.Divider />
                <Sidebar.Link to="/company">
                  <Icon name="building" />
                  Bedrock Inc.
                </Sidebar.Link>
                <Sidebar.Link to="/settings">
                  <Icon name="cog" />
                  Settings
                </Sidebar.Link>
                <Sidebar.Link to="/docs/api/getting-started">
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
