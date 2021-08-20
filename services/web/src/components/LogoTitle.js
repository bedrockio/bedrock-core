import React from 'react';
import { Header, Image, Divider } from 'semantic';
import { Link } from 'react-router-dom';
import Logo from 'assets/logo.svg';

export default ({ title }) => {
  return (
    <React.Fragment>
      <Link to="/">
        <Image
          src={Logo}
          alt="Logo"
          style={{ height: '75px', margin: '0 auto' }}
        />
      </Link>
      <Header as="h3" textAlign="center" style={{ textTransform: 'uppercase' }}>
        {title}
      </Header>
    </React.Fragment>
  );
};
