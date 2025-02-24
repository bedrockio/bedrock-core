import React from 'react';
import { Loader } from 'semantic';

import screen from 'helpers/screen';

class LoadingScreen extends React.Component {
  render() {
    return <Loader active />;
  }
}

export default screen(LoadingScreen);
