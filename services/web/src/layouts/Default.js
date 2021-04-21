import React from 'react';
import { withSession } from 'stores';
import { NavLink } from 'react-router-dom';
import { Container } from 'semantic';
import Header from 'components/Header';
import Footer from 'components/Footer';
import Protected from 'components/Protected';
import Sidebar from './Sidebar';

import logo from 'assets/bedrock.svg';

@withSession
export default class DefaultLayout extends React.Component {
  render() {
    return (
      <Sidebar>
        <Sidebar.Menu>
          <Sidebar.Item as={NavLink} to="/">
            <img style={{ height: '30px' }} className="logo" src={logo} />
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
        <Sidebar.Content>
          <Container>
            <Header />
            <main>
              {this.props.children}
            </main>
            <Footer />
          </Container>
        </Sidebar.Content>
      </Sidebar>
    );
  }
}
