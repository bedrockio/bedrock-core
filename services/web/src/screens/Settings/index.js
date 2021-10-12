import React from 'react';
import { withSession } from 'stores';
import screen from 'helpers/screen';

@screen
@withSession
export default class Settings extends React.Component {
  render() {
    const { user } = this.context;
    return (
      <div>
        From Settings => {user.name} ({user.email})
      </div>
    );
  }
}
