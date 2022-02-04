import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Icon, Container, Button } from 'semantic';
import Footer from 'components/Footer';
import { Layout } from 'components';
import bem from 'helpers/bem';

import ConnectionError from 'components/ConnectionError';

import logo from 'assets/logo.svg';
import './portal.less';

import Settings from './Settings';
/*

*/

@bem
export default class PortalLayout extends React.Component {
  render() {
    return (
      <React.Fragment>
        <ConnectionError />
        <Layout className={this.getElementClass('menu')}>
          <Layout
            className={this.getElementClass('menu-top')}
            horizontal
            center
            spread>
            <NavLink className="logo" to="/">
              <img height="30" src={logo} />
            </NavLink>
            <div>
              <Settings trigger={<Button>Settings</Button>} size="tiny" />
              <Button primary compact as={NavLink} to="/">
                Dashboard &rarr;
              </Button>
            </div>
          </Layout>
          <Menu
            className={this.getElementClass('menu-bottom')}
            secondary
            pointing>
            <Container>
              <Menu.Item as={NavLink} to="/docs/getting-started">
                <Icon name="terminal" /> API Docs
              </Menu.Item>
              <Menu.Item as={NavLink} to="/docs/ui">
                <Icon name="cube" /> UI Components
              </Menu.Item>
              <Menu.Item position="right" style={{ padding: 0 }}></Menu.Item>
            </Container>
          </Menu>
        </Layout>
        <Layout className={this.getElementClass('content')}>
          <Container>
            <main>{this.props.children}</main>
            <Footer />
          </Container>
        </Layout>
      </React.Fragment>
    );
  }
}
