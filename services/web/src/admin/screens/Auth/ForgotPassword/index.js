import React from 'react';
import { Segment, Message, Grid } from 'semantic-ui-react';

import { request } from 'utils/api';
import PageCenter from 'admin/components/PageCenter';
import LogoTitle from 'admin/components/LogoTitle';
import Form from './Form';

import { Link } from 'react-router-dom';

export default class Apply extends React.Component {
  state = {
    error: null,
    success: false,
    email: null,
    loading: false
  };

  onSubmit = (body) => {
    this.setState({ email: body.email, loading: true });
    return request({
      method: 'POST',
      path: '/1/auth/request-password',
      body
    })
      .then(() => {
        this.setState({ success: true, error: null });
      })
      .catch((c) => {
        this.setState({ error: c, loading: false });
      });
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
              <Form onSubmit={this.onSubmit} loading={loading} />
            )}
          </Segment>
          <Segment secondary>
            <Grid>
              <Grid.Column floated="left" width={8}>
                <Link to="/admin/login">Login</Link>
              </Grid.Column>
              <Grid.Column floated="right" width={8} textAlign="right">
                <Link to="/admin/signup">Dont have an account</Link>
              </Grid.Column>
            </Grid>
          </Segment>
        </Segment.Group>
      </PageCenter>
    );
  }
}
