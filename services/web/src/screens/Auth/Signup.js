import { useState } from 'react';
import { Link, useNavigate } from '@bedrockio/router';

import {
  Button,
  Center,
  Paper,
  PasswordInput,
  Stack,
  TextInput,
  Text,
  Group,
  Anchor,
  Title,
} from '@mantine/core';

import { useForm, isEmail } from '@mantine/form';

import { useSession } from 'stores/session';

import Logo from 'components/Logo';
import ErrorMessage from 'components/ErrorMessage';
import PhoneField from 'components/form-fields/Phone';
import Federated from 'components/Auth/Federated';
import Meta from 'components/Meta';

import { useRequest } from 'utils/api';
import { AUTH_TYPE, AUTH_CHANNEL } from 'utils/env';

export default function SignupPassword() {
  const navigate = useNavigate();
  const { authenticate } = useSession();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signupRequest = useRequest({
    method: 'POST',
    path: '/1/signup',
    manual: true,
    onSuccess: ({ data }) => {
      const { token, challenge } = data;
      if (token) {
        authenticate(token).then(() => {
          navigate('/onboard');
        });
      } else if (challenge) {
        navigate('/confirm-code', challenge);
      }
    },
    onError: (err) => {
      setError(err);
      setLoading(false);
    },
  });

  const form = useForm({
    mode: 'controlled',
    initialValues: {
      firstName: '',
      lastName: '',
      phone: '',
      password: '',
      email: '',
    },
    validate: {
      email: isEmail('Invalid email'),
    },
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

  return (
    <Group justify="center" align="center" pt={{ base: 30, sm: 120 }}>
      <Stack w={{ base: '100%', sm: 480 }} align="center">
        <Meta title="Signup" />
        <Logo maw={200} title="Login" />
        <Paper mt="md" w="100%" p="lg" radius="md" withBorder>
          <Title order={3} mb="md">
            Signup
          </Title>
          <form
            onSubmit={form.onSubmit((formValues) => {
              signupRequest.request({
                body: {
                  ...formValues,
                  authChannel: AUTH_CHANNEL,
                },
              });
            })}>
            <Stack spacing="md">
              {signupRequest.error?.type !== 'validation' && (
                <ErrorMessage error={error} />
              )}

              <TextInput
                label="First Name"
                placeholder="First Name"
                autoComplete="given-name"
                error={error?.hasField?.('firstName')}
                {...form.getInputProps('firstName')}
              />
              <TextInput
                label="Last Name"
                name="lastName"
                placeholder="Last Name"
                autoComplete="family-name"
                error={error?.hasField?.('lastName')}
                {...form.getInputProps('lastName')}
              />
              <TextInput
                label="Email"
                type="email"
                placeholder="Email"
                autoComplete="email"
                name="email"
                error={error}
                {...form.getInputProps('email')}
              />

              <PhoneField
                label="Phone"
                placeholder="Phone"
                error={error}
                {...form.getInputProps('phone')}
              />

              {AUTH_TYPE === 'password' && (
                <PasswordInput
                  required
                  label="Password"
                  type="password"
                  placeholder="Password"
                  {...form.getInputProps('password')}
                />
              )}

              <Federated
                type="signup"
                onAuthStop={onAuthStop}
                onAuthStart={onAuthStart}
                onError={onAuthError}
              />

              <Button
                fullWidth
                loading={loading}
                disabled={loading}
                variant="filled"
                type="submit">
                Signup
              </Button>

              <Text size="xs" c="dimmed">
                Already have an account?{' '}
                <Anchor component={Link} to="/login">
                  Login
                </Anchor>
              </Text>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </Group>
  );
}
