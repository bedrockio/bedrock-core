import React from 'react';
import { Header } from 'semantic-ui-react';

export default class NotFound extends React.Component {

  render() {
    const { message } = this.props;
    return (
      <Header as="h1" textAlign="center">
        {message || "Sorry that page wasn't found."}
      </Header>
    );
  }

}
