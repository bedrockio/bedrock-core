import React from 'react';
import { screen } from 'helpers';
import { NotFound as NotFoundComponent } from 'components';

@screen
export default class NotFound extends React.Component {
  render() {
    return (
      <NotFoundComponent />
    );
  }
}
