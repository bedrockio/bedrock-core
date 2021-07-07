import React from 'react';
import { Layout } from './Layout';

export default (props) => (
  <Layout
    center
    style={{
      height: '100vh',
      margin: '0 auto',
      padding: '0 15px',
      alignItems: 'stretch',
      maxWidth: props.maxWidth || '550px',
    }}>
    {props.children}
  </Layout>
);
