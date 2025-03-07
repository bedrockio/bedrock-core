import React, { useState } from 'react';
import { Form, Segment, Grid } from 'semantic';
import { Link, useNavigate } from '@bedrockio/router';

import { useSession } from 'stores/session';

import LogoTitle from 'components/LogoTitle';
import ErrorMessage from 'components/ErrorMessage';
import EmailField from 'components/form-fields/Email';
import PhoneField from 'components/form-fields/Phone';
import OptionalPassword from 'components/Auth/OptionalPassword';
import Federated from 'components/Auth/Federated';
import Meta from 'components/Meta';

import { request } from 'utils/api';
import { AUTH_TYPE, AUTH_TRANSPORT } from 'utils/env';

export default function SignupPassword() {
  const navigate = useNavigate();
  const { authenticate } = useSession();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [body, setBody] = useState({});

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

      const { data } = await request({
        method: 'POST',
        path: '/1/signup',
        body: {
          ...body,
          type: AUTH_TYPE,
          transport: AUTH_TRANSPORT,
        },
      });

      const { token, challenge } = data;

      if (token) {
        await authenticate(data.token);
        navigate('/onboard');
      } else if (challenge) {
        navigate('/confirm-code', challenge);
      }
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  }

  function render() {
    return (
      <React.Fragment>
        <Meta title="Signup" />
        <LogoTitle title="Create your account" />
        <Form size="large" loading={loading} onSubmit={onSubmit}>
          <Segment.Group>
            <Segment padded>
              {error?.type !== 'validation' && <ErrorMessage error={error} />}
              <Form.Input
                name="firstName"
                value={body.firstName || ''}
                placeholder="First Name"
                autoComplete="given-name"
                onChange={setField}
                error={error?.hasField?.('firstName')}
              />
              <Form.Input
                name="lastName"
                value={body.lastName || ''}
                placeholder="Last Name"
                autoComplete="family-name"
                onChange={setField}
                error={error?.hasField?.('lastName')}
              />
              <EmailField
                name="email"
                value={body.email || ''}
                onChange={setField}
                error={error}
              />
              <PhoneField
                name="phone"
                value={body.phone || ''}
                onChange={setField}
                error={error}
              />
              <OptionalPassword
                name="password"
                value={body.password || ''}
                onChange={setField}
                error={error}
              />
              <Form.Button
                fluid
                primary
                size="large"
                content="Signup"
                loading={loading}
                disabled={loading}
              />
              <Federated
                type="signup"
                onAuthStop={onAuthStop}
                onAuthStart={onAuthStart}
                onError={onAuthError}
              />
            </Segment>
            <Segment secondary>
              <Grid>
                <Grid.Column floated="left" width={12}>
                  Already have an account? <Link to="/login">Login</Link>
                </Grid.Column>
              </Grid>
            </Segment>
          </Segment.Group>
        </Form>
      </React.Fragment>
    );
  }

  return render();
}
