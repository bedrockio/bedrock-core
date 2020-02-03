import React from 'react';
import { Segment, Grid } from 'semantic-ui-react';
import { observer, inject } from 'mobx-react';

import PageCenter from 'admin/components/PageCenter';
import LogoTitle from 'admin/components/LogoTitle';

import LoginForm from './Form';
import { Link } from 'react-router-dom';

@inject('auth', 'routing')
@observer
export default class Login extends React.Component {
  constructor(props, context) {
    super(props, context);
  }
  state = {
    error: null,
    success: false,
    email: null
  };

  handleOnSubmit = (body) => {
    return this.props.auth.login(body, 'login').then((err) => {
      if (err instanceof Error) return;
      this.props.routing.replace('/admin/');
    });
  };

  render() {
    const status = this.props.auth.getStatus('login');
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
                <Link to="/admin/signup">Signup</Link>
              </Grid.Column>
              <Grid.Column floated="right" width={8} textAlign="right">
                <Link to="/admin/forgot-password">Forgot Password</Link>
              </Grid.Column>
            </Grid>
          </Segment>
        </Segment.Group>
      </PageCenter>
    );
  }
}
