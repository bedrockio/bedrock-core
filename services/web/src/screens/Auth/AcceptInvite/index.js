import React from 'react';
import { Segment, Message } from 'semantic';
import { request } from 'utils/api';
import { withSession } from 'stores';
import screen from 'helpers/screen';
import LogoTitle from 'components/LogoTitle';

import Form from './Form';
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
      loading: false,
      error: null,
    };
  }

  onSubmit = async (body) => {
    try {
      const { token } = this.state;
      this.setState({
        error: null,
        loading: true,
      });
      const { data } = await request({
        method: 'POST',
        path: '/1/auth/accept-invite',
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
    const { payload, error, loading } = this.state;

    return (
      <React.Fragment>
        <LogoTitle title="Accept Invite" />
        <Segment.Group>
          <Segment padded>
            {!payload?.email && (
              <Message error>
                <Message.Header>No valid token found</Message.Header>
                <Message.Content>
                  Please ensure you either click the email link in the email or
                  <br /> copy paste the link in full.
                </Message.Content>
              </Message>
            )}
            {payload?.email && (
              <div className="wrapper">
                <p>This invite is intended for {payload?.email}</p>
                <Form
                  onSubmit={this.onSubmit}
                  error={error}
                  loading={loading}
                />
              </div>
            )}
          </Segment>
        </Segment.Group>
      </React.Fragment>
    );
  }
}
