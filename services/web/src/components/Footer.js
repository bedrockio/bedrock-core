import React from 'react';
import { withSession } from 'stores';
import { Layout } from './Layout';
import logo from 'assets/logo.svg';

@withSession
export default class Footer extends React.Component {
  render() {
    const { user } = this.context;
    if (!user) {
      return null;
    }
    return (
      <footer>
        <Layout horizontal center right>
          <span style={{ marginRight: '10px' }}>Built with</span>
          <img width="112" height="24" src={logo} />
        </Layout>
      </footer>
    );
  }
}
