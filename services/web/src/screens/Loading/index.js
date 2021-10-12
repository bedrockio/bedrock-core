import React from 'react';
import { Loader } from 'semantic';
import screen from 'helpers/screen';
import PageCenter from 'components/PageCenter';

@screen
export default class LoadingScreen extends React.Component {
  static layout = 'none';

  render() {
    return (
      <PageCenter maxWidth="400px">
        <Loader active />
      </PageCenter>
    );
  }
}
