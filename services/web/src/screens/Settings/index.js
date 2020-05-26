import React from 'react';
import { session } from 'stores';
import AppWrapper from 'components/AppWrapper';

export default class Home extends React.Component {
  render() {
    const { user } = session;
    return (
      <AppWrapper>
        From Settings => {user.name} ({user.email})
      </AppWrapper>
    );
  }
}
