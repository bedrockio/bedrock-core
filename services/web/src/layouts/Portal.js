import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Icon, Container, Button } from 'semantic';
import Footer from 'components/Footer';
import { Layout } from 'components';

import logo from 'assets/bedrock.svg';

import './portal.less';

export default class PortalLayout extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Layout className="top-menu">
          <Layout
            horizontal
            spread
            center
            style={{ padding: '20px 25px 10px 25px' }}>
            <NavLink className="logo" to="/">
              <img style={{ height: '30px' }} src={logo} />
            </NavLink>
            <div>
              <Button primary compact as={NavLink} to="/">
                Dashboard &rarr;
              </Button>
            </div>
          </Layout>
          <Menu secondary pointing style={{ margin: '0', padding: '0 15px' }}>
            <Container>
              <Menu.Item as={NavLink} to="/docs/api/getting-started">
                <Icon name="terminal" /> API Docs
              </Menu.Item>
              <Menu.Item as={NavLink} to="/docs/ui/components">
                <Icon name="cube" /> UI Components
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
