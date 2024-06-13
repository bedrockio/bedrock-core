import React from 'react';

import Logo from 'components/Logo';

import Layout from './Layout';

export default class Footer extends React.Component {
  render() {
    return (
      <footer>
        <Layout horizontal center right>
          <span style={{ marginRight: '10px' }}>Built with</span>
          <Logo width="112" height="24" />
        </Layout>
      </footer>
    );
  }
}
