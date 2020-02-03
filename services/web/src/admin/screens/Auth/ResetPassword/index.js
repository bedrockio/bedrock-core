import React from 'react';
import { Segment, Message } from 'semantic-ui-react';
import { observer, inject } from 'mobx-react';

import PageCenter from 'admin/components/PageCenter';
import LogoTitle from 'admin/components/LogoTitle';
import Form from './Form';
import { Link } from 'react-router-dom';

import { getToken, parseToken } from 'utils/api';

@inject('auth')
@observer
export default class ResetPassword extends React.Component {
  constructor(props) {
    super(props);
    const token = getToken(props);
    this.state = {
      token,
      jwt: parseToken(token)
    };
  }

  onSubmit = (body) => {
    return this.props.auth.setPassword(
      {
        ...body,
        token: this.state.token
      },
      'set-password'
    );
  };

  render() {
    const { token, jwt } = this.state;
    const status = this.props.auth.getStatus('set-password');
    return (
      <PageCenter>
        <LogoTitle title="Reset Password" />
        <Segment.Group>
          <Segment padded>
            {(!token || !jwt) && (
              <p>
                <Message error size="huge">
                  <Message.Header>No valid token found</Message.Header>
                  <Message.Content>
                    Please ensure you either click the email link in the email
                    or copy paste the link in full.
                  </Message.Content>
                </Message>
              </p>
            )}
            {status.success && (
              <Message info>
                <Message.Header>Your password has been changed!</Message.Header>
                <p>
                  Click here to open the <Link to="/admin/">Dashboard</Link>
                </p>
              </Message>
            )}
            {!status.success && token && jwt && (
              <Form onSubmit={this.onSubmit} status={status} />
            )}
          </Segment>
        </Segment.Group>
      </PageCenter>
    );
  }
}
