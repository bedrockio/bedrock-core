import React from 'react';
import { Loader, Center } from '@mantine/core';

import Meta from 'components/Meta';

export default class LoadingScreen extends React.Component {
  render() {
    return (
      <>
        <Meta title="Loading..." />
        <Center mih={400} mah={400}>
          <Loader />
        </Center>
      </>
    );
  }
}
