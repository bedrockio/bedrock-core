import React from 'react';
import { Container } from 'semantic-ui-react';
import { Header, Footer } from 'components';

export default class DefaultLayout extends React.Component {

  render() {
    return (
      <React.Fragment>
        <Header />
        <main>
          <Container>
            {this.props.children}
          </Container>
        </main>
        <Footer />
      </React.Fragment>
    );
  }

}
