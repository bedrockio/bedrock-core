import React from 'react';
import { Layout } from './Layout';
import logo from 'assets/logo.svg';
import darkLogo from 'assets/logo-inverted.svg';
import ThemedImage from './ThemedImage';

export default class Footer extends React.Component {
  render() {
    return (
      <footer>
        <Layout horizontal center right>
          <span style={{ marginRight: '10px' }}>Built with</span>
          <ThemedImage
            width="112"
            height="24"
            darkSrc={darkLogo}
            ligthSrc={logo}
          />
        </Layout>
      </footer>
    );
  }
}
