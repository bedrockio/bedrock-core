import React from 'react';
import { Form, Checkbox, Segment, Message, Grid } from 'semantic';
import { Link } from 'react-router-dom';

import { withSession } from 'stores';

import screen from 'helpers/screen';

import LogoTitle from 'components/LogoTitle';
import ErrorMessage from 'components/ErrorMessage';
import PasswordField from 'components/form-fields/Password';

import { request } from 'utils/api';
import { getUrlToken } from 'utils/token';

@screen
@withSession
export default class AcceptInvite extends React.Component {
  static layout = 'basic';

  constructor(props) {
    super(props);
    const { token, payload } = getUrlToken();
    this.state = {
      token,
      payload,
      touched: false,
      accepted: false,
      loading: false,
      error: null,
      body: {},
    };
  }

  setField = (evt, { name, value }) => {
    this.setState({
      touched: true,
      body: {
        ...this.state.body,
        [name]: value,
      },
    });
  };

  setAccepted = (evt, { checked }) => {
    this.setState({
      accepted: checked,
    });
  };

  onSubmit = async () => {
    try {
      const { accepted, token, body } = this.state;
      if (!accepted) {
        throw new Error('Please accept the terms of service.');
      }
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
      this.props.history.push(await this.context.authenticate(data.token));
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
        <LogoTitle title="Accept Invite" />
        <Segment.Group>
          <Segment padded>{this.renderBody()}</Segment>
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

  renderBody() {
    const { payload } = this.state;
    if (payload) {
      return this.renderForm(payload.sub);
    } else {
      return <Message error>No token found in request.</Message>;
    }
  }

  renderForm(email) {
    const { body, touched, accepted, error, loading } = this.state;
    return (
      <Form
        error={touched}
        loading={loading}
        size="large"
        onSubmit={this.onSubmit}>
        <p>This invite is intended for {email}</p>
        <ErrorMessage error={error} />
        <Form.Input
          name="firstName"
          value={body.firstName || ''}
          placeholder="First Name"
          autoComplete="given-name"
          onChange={this.setField}
          error={error?.hasField?.('firstName')}
        />
        <Form.Input
          name="lastName"
          value={body.lastName || ''}
          placeholder="Last Name"
          autoComplete="family-name"
          onChange={this.setField}
          error={error?.hasField?.('lastName')}
        />
        <PasswordField
          name="password"
          autoComplete="new-password"
          value={body.password || ''}
          onChange={this.setField}
          error={error}
        />
        <Form.Field error={touched && !accepted}>
          <Checkbox
            name="accepted"
            label={
              <label>
                I accept the <a href="/terms">Terms of Service</a>.
              </label>
            }
            checked={accepted}
            onChange={this.setAccepted}
          />
        </Form.Field>
        <Form.Button
          fluid
          primary
          size="large"
          content="Signup"
          loading={loading}
          disabled={loading}
        />
      </Form>
    );
  }
}
