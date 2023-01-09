import React from 'react';
import { Header } from 'semantic';
import { Link } from 'react-router-dom';

import Logo from 'assets/logo.svg';
import DarkLogo from 'assets/logo-inverted.svg';

import ThemedImage from './ThemedImage';

export default ({ title }) => {
  return (
    <React.Fragment>
      <Link to="/">
        <ThemedImage
          ligthSrc={Logo}
          darkSrc={DarkLogo}
          alt="Logo"
          style={{ height: '75px', margin: 'auto', display: 'block' }}
        />
      </Link>
      <Header as="h3" textAlign="center" style={{ textTransform: 'uppercase' }}>
        {title}
      </Header>
    </React.Fragment>
  );
};
