import React from 'react';
import { withSession } from 'stores';
import { Container } from 'semantic';
import { Layout } from './Layout';
import bedrock from 'assets/bedrock.svg';

@withSession
export default class Footer extends React.Component {
  render() {
    const { user } = this.context;
    if (!user) {
      return null;
    }
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
