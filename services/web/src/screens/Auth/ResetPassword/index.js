import React from 'react';
import { Segment, Message } from 'semantic-ui-react';
import inject from 'stores/inject';

import PageCenter from 'components/PageCenter';
import LogoTitle from 'components/LogoTitle';
import Form from './Form';
import { Link } from 'react-router-dom';

import { getToken, parseToken } from 'utils/token';

@inject('auth')
export default class ResetPassword extends React.Component {

  constructor(props) {
    super(props);
    const token = getToken(props);
    this.state = {
      token,
      jwt: parseToken(token),
      loading: false,
      success: false,
      error: null,
    };
  }

  onSubmit = async (body) => {
    try {
      this.setState({
        loading: true,
      });
      await this.context.auth.setPassword(body);
      this.setState({
        loading: false,
        success: true,
      });
    } catch(error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    const { jwt, error, loading, success } = this.state;
    return (
      <PageCenter>
        <LogoTitle title="Reset Password" />
        <Segment.Group>
          <Segment padded>
            {(!jwt) && (
              <Message error>
                <Message.Header>No valid token found</Message.Header>
                <Message.Content>
                  Please ensure you either click the email link in the email
                  or copy paste the link in full.
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
            {!success && jwt && (
              <Form onSubmit={this.onSubmit} loading={loading} error={error} />
            )}
          </Segment>
        </Segment.Group>
      </PageCenter>
    );
  }
}
