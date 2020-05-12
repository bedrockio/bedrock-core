import React from 'react';
import { Header, Container } from 'semantic-ui-react';
import AppWrapper from './AppWrapper';

export default class NotFound extends React.Component {

  render() {
    const { message } = this.props;
    if (message) {
      return (
        <Container>
          <Header as="h1" textAlign="center">
            {message}
          </Header>
        </Container>
      );
    } else {
      return (
        <AppWrapper>
          <Container>
            <Header as="h1" textAlign="center">
              Sorry that page wasn't found.
            </Header>
          </Container>
        </AppWrapper>
      );
    }
  }

}
