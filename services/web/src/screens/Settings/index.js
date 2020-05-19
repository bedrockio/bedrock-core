import React from 'react';
import inject from 'stores/inject';
import AppWrapper from 'components/AppWrapper';

@inject('session')
export default class Home extends React.Component {
  render() {
    const { user } = this.context.session;
    return (
      <AppWrapper>
        From Settings => {user.name} ({user.email})
      </AppWrapper>
    );
  }
}
