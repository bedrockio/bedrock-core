import { useState } from 'react';

import {
  Button,
  Center,
  Paper,
  PasswordInput,
  Stack,
  TextInput,
  Title,
  Text,
} from '@mantine/core';

import { isEmail, useForm } from '@mantine/form';

import { Link, useNavigate } from '@bedrockio/router';

import { useSession } from 'stores/session';
import Meta from 'components/Meta';

import Federated from 'components/Auth/Federated';
import ErrorMessage from 'components/ErrorMessage';
import Logo from 'components/Logo';

import { request } from 'utils/api';
import { AUTH_TYPE, AUTH_CHANNEL, APP_NAME } from 'utils/env';

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
    mode: 'uncontrolled',
    initialValues: {
      password: '',
      email: '',
    },
    validate: {
      email: isEmail('Invalid email'),
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
    <Center pt={{ base: 100, sm: 180 }}>
      <Stack w={{ base: '95vw', sm: 480 }} align="center">
        <Meta title="Login" />

        <Logo maw={200} title="Login" />

        <Paper mt="md" w="100%" p="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3}>Login</Title>
            <ErrorMessage error={error} />
            <form onSubmit={form.onSubmit(onSubmit)}>
              <Stack gap="md">
                <TextInput
                  required
                  label="Email"
                  type="email"
                  placeholder="Email"
                  {...form.getInputProps('email')}
                />
                {AUTH_TYPE === 'password' && (
                  <PasswordInput
                    required
                    label="Password"
                    type="password"
                    description={
                      <>
                        Forgot you password{' '}
                        <Link to="/forgot-password">click here</Link>
                      </>
                    }
                    placeholder="Password"
                    {...form.getInputProps('password')}
                  />
                )}

                <Federated
                  type="login"
                  onAuthStop={onAuthStop}
                  onAuthStart={onAuthStart}
                  onAuthError={onAuthError}
                />

                <Button
                  fullWidth
                  loading={loading}
                  disabled={loading}
                  variant="filled"
                  type="submit">
                  Login
                </Button>

                <Text>
                  Don't have an account? <Link to="/signup">Register</Link>
                </Text>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Stack>
    </Center>
  );
}
