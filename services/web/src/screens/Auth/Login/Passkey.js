import React from 'react';
import { Link } from 'react-router-dom';
import { Segment, Grid, Form, Message } from 'semantic';

import { withSession } from 'contexts/session';

import screen from 'helpers/screen';

import Logo from 'components/LogoTitle';
import ErrorMessage from 'components/ErrorMessage';
import EmailField from 'components/form-fields/Email';
import Federated from 'components/Auth/Federated';

import { loginWithPasskey } from 'utils/passkey';

@screen
@withSession
export default class PasskeyLogin extends React.Component {
  static layout = 'basic';

  state = {
    email: '',
    error: null,
    loading: false,
  };

  componentDidMount() {
    if (this.context.isLoggedIn()) {
      this.props.history.push('/');
    }
  }

  setField = (evt, { name, value }) => {
    this.setState({
      [name]: value,
    });
  };

  onVerifyStart = () => {
    this.setState({
      loading: true,
    });
  };

  onVerifyStop = () => {
    this.setState({
      loading: false,
    });
  };

  onSubmit = async () => {
    try {
      this.setState({
        error: null,
        loading: true,
      });
      const { email } = this.state;

      const { data } = await loginWithPasskey(email);
      const next = await this.context.authenticate(data.token);
      this.props.history.push(next);
    } catch (error) {
      if (error.status === 404) {
        this.props.history.push('/signup', {
          type: 'passkey',
          body: {
            email: this.state.email,
          },
        });
      } else {
        this.setState({
          error,
          loading: false,
        });
      }
    }
  };

  onSignupClick = (evt) => {
    evt.preventDefault();
    this.props.history.push('/signup', {
      type: 'passkey',
    });
  };

  render() {
    const { error, loading, email } = this.state;
    return (
      <React.Fragment>
        <Logo title="Login" />
        <Segment.Group>
          <Segment padded>
            <Form
              size="large"
              error={!!error}
              loading={loading}
              onSubmit={this.onSubmit}>
              {error?.type !== 'validation' && <ErrorMessage error={error} />}
              <EmailField
                name="email"
                error={error}
                value={email}
                onChange={this.setField}
                autoComplete="webauthn"
              />
              <Form.Button
                fluid
                primary
                size="large"
                content="Login"
                loading={loading}
                disabled={loading}
              />
              <Federated
                onVerifyStart={this.onVerifyStart}
                onVerifyStop={this.onVerifyStop}
              />
            </Form>
          </Segment>
          <Segment secondary>
            <Grid>
              <Grid.Column floated="left" width={8}>
                <Link to="/signup" onClick={this.onSignupClick}>
                  Signup
                </Link>
              </Grid.Column>
            </Grid>
          </Segment>
        </Segment.Group>
      </React.Fragment>
    );
  }

  renderFieldErrors(error, name) {
    if (error) {
      const details = error.getFieldDetails?.(name);
      if (details) {
        return (
          <React.Fragment>
            <Message size="small" error>
              <Message.Content>
                {details.map((d, i) => {
                  return <div key={i}>{d.message}</div>;
                })}
              </Message.Content>
            </Message>
          </React.Fragment>
        );
      }
    }
  }
}
