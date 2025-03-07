import React from 'react';
import { Loader } from 'semantic';

import Meta from 'components/Meta';

export default class LoadingScreen extends React.Component {
  render() {
    return (
      <>
        <Meta title="Loading..." />
        <Loader active />
      </>
    );
  }
}
