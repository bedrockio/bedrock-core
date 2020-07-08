import React from 'react';
import { withSession } from 'stores';
import AppWrapper from 'components/AppWrapper';

@withSession
export default class Home extends React.Component {
  render() {
    const { user } = this.context;
    return (
      <AppWrapper>
        From Settings => {user.name} ({user.email})
      </AppWrapper>
    );
  }
}
