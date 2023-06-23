import React from 'react';
import { Link } from 'react-router-dom';
import { Message, Segment } from 'semantic';

import screen from 'helpers/screen';
import { withSession } from 'stores/session';
import { withBasicLayout } from 'layouts/Basic';

import LogoTitle from 'components/LogoTitle';

import { request } from 'utils/api';
import { getUrlToken } from 'utils/token';

import Form from './Form';

@screen
@withSession
@withBasicLayout
export default class ResetPassword extends React.Component {
  constructor(props) {
    super(props);
    const { token, payload } = getUrlToken();
    this.state = {
      token,
      payload,
      loading: false,
      success: false,
      error: null,
    };
  }

  onSubmit = async (body) => {
    try {
      const { password, repeat } = body;
      if (password !== repeat) {
        throw new Error('Passwords do not match.');
      }
      const { token } = this.state;
      this.setState({
        loading: true,
        error: null,
      });
      const { data } = await request({
        method: 'POST',
        path: '/1/auth/set-password',
        token,
        body: {
          password,
        },
      });
      this.setState({
        loading: false,
        success: true,
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
    const { payload, error, loading, success } = this.state;
    return (
      <React.Fragment>
        <LogoTitle title="Reset Password" />
        <Segment.Group>
          <Segment padded>
            {!payload && (
              <Message error>
                <Message.Header>No valid token found</Message.Header>
                <Message.Content>
                  Please ensure you either click the email link in the email or
                  copy paste the link in full.
                </Message.Content>
              </Message>
            )}
            {success && (
              <Message info>
                <Message.Header>Your password has been changed!</Message.Header>
                <p>
                  Click here to open the <Link to="/">Dashboard</Link>
                </p>
              </Message>
            )}
            {!success && payload && (
              <Form onSubmit={this.onSubmit} loading={loading} error={error} />
            )}
          </Segment>
        </Segment.Group>
      </React.Fragment>
    );
  }
}
