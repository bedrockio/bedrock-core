import React from 'react';
import { screen } from 'helpers';
import { Header } from 'semantic';
import PageCenter from 'components/PageCenter';

@screen
export default class NotFound extends React.Component {
  static layout = 'none';

  render() {
    return (
      <PageCenter>
        <Header as="h1" textAlign="center">
          Sorry that page wasn't found.
        </Header>
      </PageCenter>
    );
  }
}
