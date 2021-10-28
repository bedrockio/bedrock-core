import React from 'react';
import { Segment, Message, Grid } from 'semantic';
import { request } from 'utils/api';
import PageCenter from 'components/PageCenter';
import LogoTitle from 'components/LogoTitle';
import Form from './Form';

import { Link } from 'react-router-dom';

export default class ForgotPassword extends React.Component {
  static layout = 'none';

  state = {
    success: false,
    loading: false,
    error: null,
    email: null,
  };

  onSubmit = async (body) => {
    this.setState({
      error: null,
      loading: true,
    });
    try {
      await request({
        method: 'POST',
        path: '/1/auth/request-password',
        body,
      });
      this.setState({
        email: body.email,
        success: true,
        loading: false,
      });
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    const { error, success, email, loading } = this.state;
    return (
      <PageCenter>
        <LogoTitle title="Forgot Password" />
        <Segment.Group>
          <Segment padded>
            {error && <Message error content={error.message} />}
            {success ? (
              <Message info>
                <Message.Header>Mail sent!</Message.Header>
                <p>
                  Please follow the instructions in the email we sent to{' '}
                  <b>{email}</b>
                </p>
              </Message>
            ) : (
              <Form onSubmit={this.onSubmit} loading={loading} error={error} />
            )}
          </Segment>
          <Segment secondary>
            <Grid>
              <Grid.Column floated="left" width={8}>
                <Link to="/login">Login</Link>
              </Grid.Column>
              <Grid.Column floated="right" width={8} textAlign="right">
                <Link to="/signup">Dont have an account</Link>
              </Grid.Column>
            </Grid>
          </Segment>
        </Segment.Group>
      </PageCenter>
    );
  }
}
