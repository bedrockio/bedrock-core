import React from 'react';
import { Segment, Grid } from 'semantic';
import { request } from 'utils/api';
import { withSession } from 'stores';
import screen from 'helpers/screen';
import PageCenter from 'components/PageCenter';
import LogoTitle from 'components/LogoTitle';

import Form from './Form';
import { Link } from 'react-router-dom';
import { getUrlToken } from 'utils/token';

@screen
@withSession
export default class AcceptInvite extends React.Component {
  static layout = 'none';

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

  onSubmit = async (body) => {
    try {
      const { token } = this.state;
      this.setState({
        error: null,
        loading: true,
      });
      const { data } = await request({
        method: 'POST',
        path: '/1/auth/accept-invite',
        token,
        body,
      });
      this.context.setToken(data.token);
      await this.context.load();
      this.props.history.push('/');
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    const { payload, error, loading } = this.state;
    return (
      <PageCenter>
        <LogoTitle title="Accept Invite" />
        <Segment.Group>
          <Segment padded>
            <div className="wrapper">
              <p>This invite is intended for {payload?.email}</p>
              <Form onSubmit={this.onSubmit} error={error} loading={loading} />
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
      </PageCenter>
    );
  }
}
