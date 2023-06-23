import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button, Icon, Menu } from 'semantic';

import bem from 'helpers/bem';

import { Layout } from 'components';
import ThemedImage from 'components/ThemedImage';

import ConnectionError from 'components/ConnectionError';

import darkLogo from 'assets/logo-inverted.svg';
import logo from 'assets/logo.svg';

import { wrapComponent } from 'utils/hoc';

import './portal.less';

@bem
export default class PortalLayout extends React.Component {
  render() {
    return (
      <div className={this.getBlockClass()}>
        <ConnectionError />
        <Layout className={this.getElementClass('menu')}>
          <Layout
            className={this.getElementClass('menu-top')}
            horizontal
            spread>
            <Layout.Group>
              <NavLink className="logo" to="/">
                <ThemedImage height="40" ligthSrc={logo} darkSrc={darkLogo} />
              </NavLink>
              <Menu className={this.getElementClass('menu-bottom')} secondary>
                <Menu.Item as={NavLink} to="/docs/getting-started">
                  <Icon name="terminal" /> API Docs
                </Menu.Item>
                <Menu.Item as={NavLink} to="/docs/ui">
                  <Icon name="cube" /> UI Components
                </Menu.Item>
                <Menu.Item as={NavLink} to="/docs/icons">
                  <Icon name="icons" /> Icons
                </Menu.Item>
              </Menu>
            </Layout.Group>
            <Layout.Group>
              <Button primary compact as={NavLink} to="/">
                Dashboard &rarr;
              </Button>
            </Layout.Group>
          </Layout>
        </Layout>
        <Layout className={this.getElementClass('content')}>
          {this.props.children}
        </Layout>
      </div>
    );
  }
}

export function withPortalLayout(Component) {
  class Wrapper extends React.PureComponent {
    render() {
      return (
        <PortalLayout>
          <Component {...this.props} />
        </PortalLayout>
      );
    }
  }
  return wrapComponent(Component, Wrapper);
}
