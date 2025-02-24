import React from 'react';
import { withRouter, Link } from '@bedrockio/router';
import { Button, Segment } from 'semantic';

import { withSession } from 'stores/session';

class Lockout extends React.Component {
  componentDidMount() {
    if (!this.context.isLoggedIn()) {
      this.props.history.push('/login');
    }
  }

  render() {
    return (
      <React.Fragment>
        <Segment.Group>
          <Segment padded>
            <p>This site cannot be accessed.</p>
          </Segment>
          <Segment secondary textAlign="right">
            <Button as={Link} to="/logout">
              Logout
            </Button>
          </Segment>
        </Segment.Group>
      </React.Fragment>
    );
  }
}

export default withRouter(withSession(Lockout));
