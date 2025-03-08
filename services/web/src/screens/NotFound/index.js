import React from 'react';
import { Header } from 'semantic';
import Breadcrumbs from 'components/Breadcrumbs';
import Meta from 'components/Meta';

export default class NotFound extends React.Component {
  render() {
    const { message, ...rest } = this.props;
    return (
      <React.Fragment>
        <Meta title="Not Found" />
        <Breadcrumbs {...rest} />
        <Header as="h1">
          {this.props.message || 'Sorry that page was not found.'}
        </Header>
      </React.Fragment>
    );
  }
}
