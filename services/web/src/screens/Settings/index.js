import React from 'react';
import { withSession } from 'stores';
import { screen } from 'helpers';
import AppWrapper from 'components/AppWrapper';

@screen
@withSession
export default class Settings extends React.Component {
  render() {
    const { user } = this.context;
    return (
      <AppWrapper>
        From Settings => {user.name} ({user.email})
      </AppWrapper>
    );
  }
}
