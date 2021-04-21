import React from 'react';
import { withSession } from 'stores';
import { NavLink } from 'react-router-dom';
import { Container, Icon } from 'semantic';
import Header from 'components/Header';
import Footer from 'components/Footer';
import Protected from 'components/Protected';
import Sidebar from './Sidebar';

import logo from 'assets/favicon.svg';

@withSession
export default class DefaultLayout extends React.Component {
  render() {
    const { user } = this.context;
    return (
      <Sidebar>
        {user && (
          <Sidebar.Menu dark>
            <Sidebar.Item as={NavLink} to="/">
              <img style={{ width: '30px' }} className="logo" src={logo} />
            </Sidebar.Item>
            <Sidebar.Item as={NavLink} to="/shops">
              Shops
            </Sidebar.Item>
            <Sidebar.Item as={NavLink} to="/settings">
              Settings
            </Sidebar.Item>
            <Sidebar.Item as={NavLink} to="/docs/getting-started">
              API Docs
            </Sidebar.Item>
            <Sidebar.Item as={NavLink} to="/components">
              Components
            </Sidebar.Item>
            <Protected endpoint="events">
              <Sidebar.Item as={NavLink} to="/users">
                Users
              </Sidebar.Item>
            </Protected>
            <Protected endpoint="events">
              <Sidebar.Item as={NavLink} to="/invites">
                Invites
              </Sidebar.Item>
            </Protected>
            <Sidebar.Item as={NavLink} to="/logout">
              Log Out
            </Sidebar.Item>
          </Sidebar.Menu>
        )}
        <Sidebar.Content>
          <Sidebar.Trigger>
            <Icon name="bars" />
          </Sidebar.Trigger>
          <Header />
          <main>
            <Container>{this.props.children}</Container>
          </main>
          <Footer />
        </Sidebar.Content>
      </Sidebar>
    );
  }
}
