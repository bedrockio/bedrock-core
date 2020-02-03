import React from 'react';
import { observer, inject } from 'mobx-react';
import { NavLink, Link } from 'react-router-dom';
import { Container, Dropdown, Icon, Menu } from 'semantic-ui-react';
import logoInverted from 'admin/assets/logo.svg';

@inject('me')
@observer
export default class AppWrapper extends React.Component {
  render() {
    const { me } = this.props;
    const isAdmin = me.user.roles.indexOf('admin') !== -1;
    return (
      <div>
        <Menu inverted fixed="top">
          <Container>
            <Menu.Item as={Link} to="/admin/">
              <img
                style={{ width: '30px' }}
                className="logo"
                src={`${logoInverted}`}
              />
            </Menu.Item>
            <Menu.Item as={NavLink} to="/admin/shops">
              Shops
            </Menu.Item>
            <Menu.Menu position="right">
              <Dropdown
                className="account"
                item
                trigger={
                  <span>
                    <Icon name="user" /> {me.user && me.user.name}
                  </span>
                }
              >
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/admin/settings">
                    Settings
                  </Dropdown.Item>
                  {isAdmin && (
                    <Dropdown.Item as={Link} to="/admin/users">
                      Users
                    </Dropdown.Item>
                  )}
                  {isAdmin && (
                    <Dropdown.Item as={Link} to="/admin/invites">
                      Invites
                    </Dropdown.Item>
                  )}
                  <Dropdown.Item as={Link} to="/admin/logout">
                    Log Out
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Menu.Menu>
          </Container>
        </Menu>
        <Container style={{ marginTop: '100px' }}>
          {this.props.children}
        </Container>
      </div>
    );
  }
}
