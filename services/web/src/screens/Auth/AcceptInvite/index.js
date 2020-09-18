import React from 'react';
import { Segment, Grid } from 'semantic-ui-react';
import { request } from 'utils/api';
import { withSession } from 'stores';
import { screen } from 'helpers';
import PageCenter from 'components/PageCenter';
import LogoTitle from 'components/LogoTitle';

import Form from './Form';
import { Link } from 'react-router-dom';
import { getToken, parseToken } from 'utils/token';

@screen
@withSession
export default class AcceptInvite extends React.Component {

  constructor(props) {
    super(props);
    const token = getToken(props);
    const parsedToken = token && parseToken(token);
    this.state = {
      token,
      jwt: parsedToken,
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
      await this.context.loadUser();
      this.props.history.push('/');
    } catch(error) {
      this.setState({
        error,
        loading: false
      });
    }
  };

  render() {
    const { error, loading } = this.state;
    const { jwt } = this.state;
    return (
      <PageCenter>
        <LogoTitle title="Accept Invite" />
        <Segment.Group>
          <Segment padded>
            <div className="wrapper">
              <p>This invite is intended for {jwt?.email}</p>
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
