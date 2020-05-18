import React from 'react';
import { Segment, Grid } from 'semantic-ui-react';
import inject from 'stores/inject';
import PageCenter from 'components/PageCenter';
import LogoTitle from 'components/LogoTitle';

import Form from './Form';
import { Link } from 'react-router-dom';
import { getToken, parseToken } from 'utils/token';

@inject('auth')
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
      this.setState({
        loading: true,
      });
      await this.context.auth.acceptInvite(body);
      this.setState({
        loading: false
      });
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
