import React from 'react';
import { Segment, Grid } from 'semantic-ui-react';
import { observer, inject } from 'mobx-react';

import PageCenter from 'components/PageCenter';
import LogoTitle from 'components/LogoTitle';

import LoginForm from './Form';
import { Link, withRouter } from 'react-router-dom';
import { AppSession } from 'contexts/appSession';
import { request } from 'utils/api';

class Login extends React.Component {
  static contextType = AppSession;

  state = {
    status: {},
  };

  async login({ email, password }) {
    this.setState({
      status: {
        request: true,
      },
    });

    try {
      const { data } = await request({
        method: 'POST',
        path: '/1/auth/login',
        body: {
          email,
          password,
        },
      });

      const { setToken, reset } = this.context;

      reset();
      setToken(data.token);

      this.setState({
        status: {
          success: true,
        },
      });

      this.props.history.replace('/');
    } catch (e) {
      this.setState({
        status: {
          error: e,
        },
      });
    }
  }

  handleOnSubmit = async body => {
    await this.login(body);
  };

  render() {
    const { status } = this.state;
    return (
      <PageCenter>
        <LogoTitle title="Login" />
        <Segment.Group>
          <Segment padded>
            <LoginForm onSubmit={this.handleOnSubmit} status={status} />
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

export default withRouter(Login);
