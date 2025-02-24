import React from 'react';
import { withRouter } from '@bedrockio/router';

import { withSession } from 'stores/session';

import screen from 'helpers/screen';

class Dashboard extends React.Component {
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

export default screen(withRouter(withSession(Dashboard)));
