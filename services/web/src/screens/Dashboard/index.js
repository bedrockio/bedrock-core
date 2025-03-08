import React from 'react';
import { withRouter } from '@bedrockio/router';

import { withSession } from 'stores/session';

import Meta from 'components/Meta';

class Dashboard extends React.Component {
  componentDidMount() {
    this.props.history.replace('/shops');
  }

  render() {
    const { user } = this.context;
    return (
      <div>
        <Meta title="Dashboard" />
        Hello {user.name} ({user.email}) from dashboard
      </div>
    );
  }
}

export default withRouter(withSession(Dashboard));
