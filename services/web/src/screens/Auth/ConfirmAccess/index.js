import React from 'react';
import { Link } from 'react-router-dom';
import { Segment, Grid, Form } from 'semantic';

import { request } from 'utils/api';
import { withSession } from 'stores';
import screen from 'helpers/screen';
import LogoTitle from 'components/LogoTitle';
import ErrorMessage from 'components/ErrorMessage';
import Password from 'components/form-fields/Password';

@screen
@withSession
export default class ConfirmAccess extends React.Component {
  static layout = 'basic';

  state = {
    error: null,
    loading: false,
    password: '',
  };

  getRedirectPath() {
    return new URL(document.location).searchParams.get('to') || '/';
  }

  onSubmit = async () => {
    try {
      this.setState({
        error: null,
        loading: true,
      });
      await request({
        method: 'POST',
        path: '/1/auth/confirm-access',
        body: {
          password: this.state.password,
        },
      });
      await this.context.bootstrap();
      this.props.history.push(this.getRedirectPath());
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    const { error, loading, password } = this.state;

    return (
      <React.Fragment>
        <LogoTitle title="Confirm Access" />
        <Segment.Group>
          <Segment padded>
            <Form error={!!error} size="large" onSubmit={() => this.onSubmit()}>
              <ErrorMessage error={error} />
              <Password
                value={password}
                onChange={(e, { value }) => this.setState({ password: value })}
                label="Password"
                autoComplete="off"
                autoFocus
              />

              <Form.Button
                fluid
                primary
                size="large"
                content="Confirm Access"
                loading={loading}
                disabled={loading}
              />
            </Form>
          </Segment>
          <Segment secondary>
            <Grid>
              <Grid.Column floated="right" width={8} textAlign="right">
                <Link to="/forgot-password">Forgot Password</Link>
              </Grid.Column>
            </Grid>
          </Segment>
        </Segment.Group>
      </React.Fragment>
    );
  }
}
