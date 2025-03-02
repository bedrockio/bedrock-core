import React, { useState } from 'react';
import { Form, Segment, Grid } from 'semantic';
import { Link, useNavigate } from '@bedrockio/router';

import {
  Anchor,
  Button,
  Center,
  Group,
  Paper,
  PasswordInput,
  Stack,
  TextInput,
  Title,
  Text,
} from '@mantine/core';

import { useForm, isEmail } from '@mantine/form';

import { useSession } from 'stores/session';

import screen from 'helpers/screen';

import Logo from 'components/Logo';
import ErrorMessage from 'components/ErrorMessage';
import EmailField from 'components/form-fields/Email';
import PhoneField from 'components/form-fields/Phone';
import OptionalPassword from 'components/Auth/OptionalPassword';
import Federated from 'components/Auth/Federated';

import { request } from 'utils/api';
import { AUTH_TYPE, AUTH_TRANSPORT } from 'utils/env';

function SignupPassword() {
  const navigate = useNavigate();
  const { authenticate } = useSession();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const form = useForm({
    mode: 'uncontrolled',
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

  return (
    <Stack w={{ base: '100%', sm: 550 }} align="center">
      <Center mt={10} mb={20}>
        <Logo maw={200} title="Login" />
      </Center>
      <Paper miw={380} w="100%" p="xl" radius="md" withBorder>
        <form onSubmit={form.onSubmit(onSubmit)}>
          <Stack spacing="md">
            {error?.type !== 'validation' && <ErrorMessage error={error} />}

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
              onChange={setField}
              error={error?.hasField?.('lastName')}
              {...form.getInputProps('lastName')}
            />
            <TextInput
              label="Email"
              type="email"
              placeholder="Email"
              autoComplete="email"
              name="email"
              onChange={setField}
              error={error}
              {...form.getInputProps('email')}
            />

            <PhoneField
              label="Phone"
              placeholder="Phone"
              onChange={setField}
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

            <Text>
              Already have an account? <Link to="/login">Login</Link>
            </Text>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}

export default screen(SignupPassword);
