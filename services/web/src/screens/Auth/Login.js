import React, { useState } from 'react';
import { Link, useNavigate } from '@bedrockio/router';
import { Form, Grid, Segment } from 'semantic';

import screen from 'helpers/screen';
import { useSession } from 'stores/session';

import Federated from 'components/Auth/Federated';
import ErrorMessage from 'components/ErrorMessage';
import EmailField from 'components/form-fields/Email';
import OptionalPassword from 'components/Auth/OptionalPassword';
import Logo from 'components/LogoTitle';

import { request } from 'utils/api';
import { AUTH_TYPE, AUTH_TRANSPORT } from 'utils/env';

function PasswordLogin() {
  const navigate = useNavigate();
  const { authenticate } = useSession();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [body, setBody] = useState({
    email: '',
  });

  function onAuthStart() {
    setLoading(true);
  }

  function onAuthStop() {
    setLoading(false);
  }

  function onAuthError(error) {
    setError(error);
    setLoading(false);
  }

  function setField(evt, { name, value }) {
    setBody({
      ...body,
      [name]: value,
    });
  }

  async function onSubmit() {
    try {
      setError(null);
      setLoading(true);

      const { data } = await login();
      const { token, challenge } = data;

      if (token) {
        const next = await authenticate(token);
        navigate(next);
      } else if (challenge) {
        navigate('/confirm-code', challenge);
      }
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  }

  function login() {
    if (AUTH_TYPE === 'password') {
      return loginPassword();
    } else {
      return loginOtp();
    }
  }

  async function loginPassword() {
    return await request({
      method: 'POST',
      path: `/1/auth/password/login`,
      body,
    });
  }

  async function loginOtp() {
    return await request({
      method: 'POST',
      path: `/1/auth/otp/send`,
      body: {
        ...body,
        type: AUTH_TYPE,
        transport: AUTH_TRANSPORT,
      },
    });
  }

  function render() {
    return (
      <React.Fragment>
        <Logo title="Login" />
        <Form
          size="large"
          error={!!error}
          loading={loading}
          onSubmit={onSubmit}>
          <Segment.Group>
            <Segment padded>
              <ErrorMessage error={error} />
              <EmailField
                name="email"
                error={error}
                value={body.email || ''}
                onChange={setField}
              />
              <OptionalPassword
                current
                name="password"
                error={error}
                value={body.password || ''}
                onChange={setField}
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
                type="login"
                onAuthStop={onAuthStop}
                onAuthStart={onAuthStart}
                onAuthError={onAuthError}
              />
            </Segment>
            <Segment secondary>
              <Grid>
                <Grid.Column floated="left" width={8}>
                  <Link to="/signup">Signup</Link>
                </Grid.Column>
                {AUTH_TYPE === 'password' && (
                  <Grid.Column floated="right" width={8} textAlign="right">
                    <Link to="/forgot-password">Forgot Password</Link>
                  </Grid.Column>
                )}
              </Grid>
            </Segment>
          </Segment.Group>
        </Form>
      </React.Fragment>
    );
  }

  return render();
}

export default screen(PasswordLogin);
