import React from 'react';
import { NavLink } from 'react-router-dom';
import { Container, Menu, Icon } from 'semantic';
import { Header, Footer } from 'components';
import Sidebar from './Sidebar';

export default class DefaultLayout extends React.Component {

  render() {
    return (
      <Sidebar>
        <Sidebar.Menu dark>
          <Menu.Item as={NavLink} to="/shops">
            Shops
          </Menu.Item>
        </Sidebar.Menu>
        <Sidebar.Content>
          <Sidebar.Trigger>
            <Icon name="bars" />
          </Sidebar.Trigger>
          {/*<Header />*/}
          <main>
            <Container>
              {this.props.children}
            </Container>
          </main>
          <Footer />
        </Sidebar.Content>
      </Sidebar>
    );
  }

}
