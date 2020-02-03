import React from 'react';
import { Header, Image } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import Logo from 'admin/assets/logo.svg';

export default ({ title }) => {
  return (
    <React.Fragment>
      <Link to="/admin/">
        <Image
          src={Logo}
          alt="Logo"
          style={{ height: '80px', margin: '0 auto' }}
        />
      </Link>
      <Header as="h3" textAlign="center" style={{ textTransform: 'uppercase' }}>
        {title}
      </Header>
    </React.Fragment>
  );
};
