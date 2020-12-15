import React from 'react';
import { Container } from 'semantic-ui-react';
import { Layout } from './Layout';
import bedrock from 'assets/bedrock.svg';

export default class Footer extends React.Component {
  render() {
    return (
      <footer>
        <Container>
          <Layout horizontal center right>
            Built with&nbsp;&nbsp;
            <img width="112" height="24" src={bedrock} />
          </Layout>
        </Container>
      </footer>
    );
  }
}
