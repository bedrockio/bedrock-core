import React from 'react';
import { Layout } from './Layout';
import logo from 'assets/logo.svg';

export default class Footer extends React.Component {
  render() {
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
