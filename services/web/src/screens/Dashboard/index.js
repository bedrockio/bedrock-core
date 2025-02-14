import React from 'react';
import { withRouter } from '@bedrockio/router';

import { withSession } from 'stores/session';

import screen from 'helpers/screen';

@screen
@withRouter
@withSession
export default class Dashboard extends React.Component {
  componentDidMount() {
    this.props.history.replace('/shops');
  }

  render() {
    const { user } = this.context;
    return (
      <div>
        Hello {user.name} ({user.email}) from dashboard
      </div>
    );
  }
}
