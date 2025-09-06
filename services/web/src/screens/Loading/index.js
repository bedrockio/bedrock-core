import { Center, Loader } from '@mantine/core';
import React from 'react';

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
