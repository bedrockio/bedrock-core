import React from 'react';
import { NavLink } from 'react-router-dom';
import { Container, Icon } from 'semantic';
import { Layout } from 'components/Layout';

export default class Header extends React.Component {
  render() {
    return (
      <header>
        <Container>
          <Layout horizontal center right>
            <NavLink to="/settings">
              <Icon name="user" />
            </NavLink>
          </Layout>
        </Container>
      </header>
    );
  }
}
