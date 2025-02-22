import React from 'react';

import PageCenter from 'components/PageCenter';
import ConnectionError from 'components/ConnectionError';

import '@mantine/core/styles.css';

import { MantineProvider } from '@mantine/core';

const theme = createTheme({
  /** Put your mantine theme override here */
});

export default class BasicLayout extends React.Component {
  render() {
    return (
      <MantineProvider theme={theme}>
        <PageCenter>
          <ConnectionError />
          {this.props.children}
        </PageCenter>
      </MantineProvider>
    );
  }
}
