import React from 'react';
import { Segment, Grid } from 'semantic-ui-react';
import inject from 'stores/inject';

import PageCenter from 'components/PageCenter';
import LogoTitle from 'components/LogoTitle';

import LoginForm from './Form';
import { Link } from 'react-router-dom';

@inject('auth')
export default class Login extends React.Component {

  state = {
    error: null,
    loading: false,
  }

  onSubmit = async (body) => {
    try {
      await this.context.auth.login(body);
      this.props.history.push('/');
    } catch(error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    const { error, loading } = this.state;
    return (
      <PageCenter>
        <LogoTitle title="Login" />
        <Segment.Group>
          <Segment padded>
            <LoginForm onSubmit={this.onSubmit} error={error} loading={loading} />
          </Segment>
          <Segment secondary>
            <Grid>
              <Grid.Column floated="left" width={8}>
                <Link to="/signup">Signup</Link>
              </Grid.Column>
              <Grid.Column floated="right" width={8} textAlign="right">
                <Link to="/forgot-password">Forgot Password</Link>
              </Grid.Column>
            </Grid>
          </Segment>
        </Segment.Group>
      </PageCenter>
    );
  }
}
