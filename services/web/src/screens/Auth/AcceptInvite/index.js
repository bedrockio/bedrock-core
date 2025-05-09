import React from 'react';
import { Segment, Grid, Button } from 'semantic';
import { Link } from '@bedrockio/router';

import { withSession } from 'stores/session';

import LogoTitle from 'components/LogoTitle';
import Meta from 'components/Meta';

import { request } from 'utils/api';
import { getUrlToken } from 'utils/token';

import Form from './Form';

class AcceptInvite extends React.Component {
  constructor(props) {
    super(props);
    const { token, payload } = getUrlToken();
    this.state = {
      token,
      payload,
      loading: false,
      error: null,
    };
  }

  onLogoutClick = () => {
    this.context.logout(true);
  };

  onSubmit = async (body) => {
    try {
      const { token } = this.state;
      this.setState({
        error: null,
        loading: true,
      });
      const { data } = await request({
        method: 'POST',
        path: '/1/invites/accept',
        token,
        body,
      });
      const next = await this.context.authenticate(data.token);
      this.props.history.push(next);
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    return (
      <React.Fragment>
        <Meta title="Accept Invite" />
        {this.context.isLoggedIn()
          ? this.renderLoggedIn()
          : this.renderLoggedOut()}
      </React.Fragment>
    );
  }

  renderLoggedIn() {
    return (
      <React.Fragment>
        <h1>Accept Invite</h1>
        <p>
          Invites can only be accepted from a logged out state. Would you like
          to logout and accept the invite?
        </p>
        <div>
          <Button onClick={this.onLogoutClick} content="Continue" />
        </div>
      </React.Fragment>
    );
  }

  renderLoggedOut() {
    const { payload, error, loading } = this.state;
    return (
      <React.Fragment>
        <LogoTitle title="Accept Invite" />
        <Segment.Group>
          <Segment padded>
            <div className="wrapper">
              <p>This invite is intended for {payload?.sub}</p>
              <Form
                payload={payload}
                onSubmit={this.onSubmit}
                error={error}
                loading={loading}
              />
            </div>
          </Segment>
          <Segment secondary>
            <Grid>
              <Grid.Column floated="left" width={12}>
                Already have an account? <Link to="/login">Login</Link>
              </Grid.Column>
            </Grid>
          </Segment>
        </Segment.Group>
      </React.Fragment>
    );
  }
}

export default withSession(AcceptInvite);
