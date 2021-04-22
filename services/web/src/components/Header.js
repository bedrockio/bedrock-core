import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from 'semantic';
import { Layout } from 'components/Layout';
import Sidebar from 'layouts/Sidebar';

export default class Header extends React.Component {
  render() {
    return (
      <div>
        <Layout horizontal right spread>
          <Layout.Group>
            <Sidebar.Trigger style={{ marginBottom:'20px' }}>
              <Icon name="bars" />
            </Sidebar.Trigger>
          </Layout.Group>
          {/* <NavLink to="/settings">
            <Icon name="user" />
          </NavLink> */}
        </Layout>
      </div>
    );
  }
}
