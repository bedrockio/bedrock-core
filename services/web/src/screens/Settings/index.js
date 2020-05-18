import React from 'react';
import inject from 'stores/inject';
import AppWrapper from 'components/AppWrapper';

@inject('me')
export default class Home extends React.Component {
  render() {
    const { me } = this.context;
    return (
      <AppWrapper>
        From Settings => {me.user.name} ({me.user.email})
      </AppWrapper>
    );
  }
}
