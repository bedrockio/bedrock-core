import React from 'react';

import { Center, Stack } from '@mantine/core';

import ConnectionError from 'components/ConnectionError';

export default class BasicLayout extends React.Component {
  render() {
    return (
      <div
        style={{
          height: '100vh',
          background:
            'linear-gradient(180deg,var(--mantine-color-brown-2) 320px, var(--mantine-color-white) 30%, var(--mantine-color-white) 100%)',
        }}>
        <ConnectionError />
        {this.props.children}
      </div>
    );
  }
}
