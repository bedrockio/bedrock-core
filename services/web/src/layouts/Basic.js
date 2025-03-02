import React from 'react';

import { Center, Stack } from '@mantine/core';

import ConnectionError from 'components/ConnectionError';

export default class BasicLayout extends React.Component {
  render() {
    return (
      <Center style={{ height: '100vh' }}>
        <Stack>
          <ConnectionError />
          {this.props.children}
        </Stack>
      </Center>
    );
  }
}
