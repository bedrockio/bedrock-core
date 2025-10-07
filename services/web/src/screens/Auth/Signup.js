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

import { isEmail, useForm } from '@mantine/form';
import React, { useState } from 'react';

import { useSession } from 'stores/session';

import Federated from 'components/Auth/Federated';
import ErrorMessage from 'components/ErrorMessage';
import Meta from 'components/Meta';
import PhoneField from 'components/form-fields/Phone';

import { useRequest } from 'utils/api';
import { AUTH_CHANNEL, AUTH_TYPE } from 'utils/env';

export default function SignupPassword() {
  const navigate = useNavigate();
  const { authenticate } = useSession();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signupRequest = useRequest({
    method: 'POST',
    path: '/1/signup',
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
    <React.Fragment>
      <Meta title="Signup" />
      <Title order={3} mb="md">
        Signup
      </Title>
      <form
        onSubmit={form.onSubmit((formValues) => {
          signupRequest.request({
            body: {
              ...formValues,
              type: AUTH_TYPE,
              channel: AUTH_CHANNEL,
            },
          });
        })}>
        <Stack gap="xs">
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
              autoComplete="new-password"
              {...form.getInputProps('password')}
            />
          )}

          <Button
            fullWidth
            loading={loading || signupRequest.loading}
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

          <Federated
            type="signup"
            onAuthStop={onAuthStop}
            onAuthStart={onAuthStart}
            onError={onAuthError}
          />
        </Stack>
      </form>
    </React.Fragment>
  );
}
