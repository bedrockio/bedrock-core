import { NavLink } from '@bedrockio/router';
import { Button, Icon, Menu } from 'semantic';

import { useClass } from 'helpers/bem';

import Logo from 'components/Logo';
import Layout from 'components/Layout';
import ConnectionError from 'components/ConnectionError';

import './portal.less';

export default function PortalLayout(props) {
  const { className, getElementClass } = useClass('portal-layout');

  return (
    <div className={className}>
      <ConnectionError />
      <Layout className={getElementClass('menu')}>
        <Layout className={getElementClass('menu-top')} horizontal spread>
          <Layout.Group>
            <NavLink className="logo" to="/">
              <Logo height="40" />
            </NavLink>
            <Menu className={getElementClass('menu-bottom')} secondary>
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
      <Layout className={getElementClass('content')}>{props.children}</Layout>
    </div>
  );
}
