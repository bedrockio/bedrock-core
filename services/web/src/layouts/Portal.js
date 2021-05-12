import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Icon, Container, Button } from 'semantic';
import Footer from 'components/Footer';
import { Layout } from 'components';

import logo from 'assets/bedrock.svg';

export default class PortalLayout extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Layout
          style={{
            background: '#f4f0eb',
            position: 'fixed',
            width: '100%',
            zIndex: '1',
          }}>
          <Layout
            horizontal
            spread
            center
            style={{ padding: '20px 25px 10px 25px' }}>
            <NavLink className="logo" to="/">
              <img style={{ height: '30px' }} src={logo} />
            </NavLink>
            <div>
              <NavLink
                to="/signup"
                style={{ marginRight: '20px', fontWeight: 'bold' }}>
                Create Account
              </NavLink>
              <Button primary as={NavLink} to="/login">
                Login
              </Button>
            </div>
          </Layout>
          <Menu secondary pointing style={{ margin: '0', padding: '0 15px' }}>
            <Container>
              <Menu.Item as={NavLink} to="/docs/getting-started">
                <Icon name="terminal" />
                &nbsp;API Docs
              </Menu.Item>
              <Menu.Item as={NavLink} to="/ui-components">
                <Icon name="cube" />
                &nbsp;UI Components
              </Menu.Item>
            </Container>
          </Menu>
        </Layout>
        <Layout style={{ padding: '131px 15px 0 15px' }}>
          <Container>
            <main>{this.props.children}</main>
            <Footer />
          </Container>
        </Layout>
      </React.Fragment>
    );
  }
}
