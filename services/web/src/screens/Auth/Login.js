import { Link, useNavigate } from '@bedrockio/router';

import {
  Anchor,
  Button,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';

import { useForm } from '@mantine/form';
import React, { useState } from 'react';

import { useSession } from 'stores/session';

import Federated from 'components/Auth/Federated';
import ErrorMessage from 'components/ErrorMessage';
import Meta from 'components/Meta';

import { request } from 'utils/api';
import { AUTH_CHANNEL, AUTH_TYPE } from 'utils/env';

function login(values) {
  if (AUTH_TYPE === 'password') {
    return loginPassword(values);
  } else {
    return loginOtp(values);
  }
}

async function loginPassword(body) {
  return await request({
    method: 'POST',
    path: `/1/auth/password/login`,
    body,
  });
}

async function loginOtp(body) {
  return await request({
    method: 'POST',
    path: `/1/auth/otp/send`,
    body: {
      ...body,
      type: AUTH_TYPE,
      authChannel: AUTH_CHANNEL,
    },
  });
}

export default function PasswordLogin() {
  const navigate = useNavigate();
  const { authenticate } = useSession();

  const form = useForm({
    initialValues: {
      password: '',
      email: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  async function onSubmit(values) {
    try {
      setError(null);
      setLoading(true);

      const { data } = await login(values);
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

  return (
    <React.Fragment>
      <Meta title="Login" />
      <Title order={3} mb="md">
        Login
      </Title>
      <ErrorMessage error={error} />
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="xs">
          <TextInput
            required
            label="Email"
            type="email"
            placeholder="Email"
            {...form.getInputProps('email')}
          />
          {AUTH_TYPE === 'password' && (
            <div>
              <PasswordInput
                required
                label="Password"
                type="password"
                placeholder="Password"
                {...form.getInputProps('password')}
              />
              <Text c="dimmed" size="xs" mt={4}>
                <Anchor tabIndex={3} component={Link} to="/forgot-password">
                  Forgot password
                </Anchor>
              </Text>
            </div>
          )}
          <Button
            fullWidth
            loading={loading}
            disabled={loading}
            variant="filled"
            type="submit">
            Login
          </Button>

          <Text size={'xs'} c="dimmed">
            Don't have an account?{' '}
            <Anchor tabIndex={4} component={Link} to="/signup">
              Register
            </Anchor>
          </Text>

          <Federated
            type="login"
            onAuthStop={onAuthStop}
            onAuthStart={onAuthStart}
            onAuthError={onAuthError}
          />
        </Stack>
      </form>
    </React.Fragment>
  );
}
