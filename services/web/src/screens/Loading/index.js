import React from 'react';
import { Loader } from 'semantic';
import screen from 'helpers/screen';

@screen
export default class LoadingScreen extends React.Component {
  static layout = 'basic';

  render() {
    return <Loader active />;
  }
}
