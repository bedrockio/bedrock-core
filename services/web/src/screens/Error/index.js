import React from 'react';
import { screen } from 'helpers';
import PageCenter from 'components/PageCenter';

@screen
export default class ErrorScreen extends React.Component {

  render() {
    return (
      <PageCenter maxWidth="400px">
        {this.props.children}
      </PageCenter>
    );
  }
}
