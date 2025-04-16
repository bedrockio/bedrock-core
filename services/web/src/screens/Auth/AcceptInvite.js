import { useState } from 'react';
import {
  Paper,
  Group,
  Button,
  Text,
  Stack,
  Container,
  TextInput,
  PasswordInput,
  Anchor,
} from '@mantine/core';
import { Link } from '@bedrockio/router';
import { useForm } from '@mantine/form';
import { omit, omitBy } from 'lodash-es';

import { useSession } from 'stores/session';

import Logo from 'components/Logo';
import Meta from 'components/Meta';

import { request } from 'utils/api';
import { getUrlToken } from 'utils/token';

/**
 * Accept Invite screen component
 * Allows users to accept invitations to the platform
 */
function AcceptInvite({ history }) {
  const { token, payload } = getUrlToken();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { isLoggedIn, logout, authenticate } = useSession();

  const form = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
      email: payload?.sub || '',
    },
    validate: {
      firstName: (value) => (!value ? 'First name is required' : null),
      lastName: (value) => (!value ? 'Last name is required' : null),
      password: (value) =>
        !value
          ? 'Password is required'
          : value.length < 8
            ? 'Password must be at least 8 characters'
            : null,
      confirmPassword: (value, values) =>
        value !== values.password ? 'Passwords do not match' : null,
    },
  });

  async function handleSubmit(values) {
    try {
      setError(null);
      setLoading(true);

      console.log(omitBy(values, ['confirmPassword', 'email']));

      const { data } = await request({
        method: 'POST',
        path: '/1/invites/accept',
        token,
        body: omit(values, ['confirmPassword', 'email']),
      });

      const next = await authenticate(data.token);
      history.push(next);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }

  function handleLogoutClick() {
    logout(true);
  }

  function renderLoggedIn() {
    return (
      <Container size="sm">
        <Stack>
          <Text size="xl" fw={700}>
            Accept Invite
          </Text>
          <Text>
            Invites can only be accepted from a logged out state. Would you like
            to logout and accept the invite?
          </Text>
          <div>
            <Button onClick={handleLogoutClick}>Continue</Button>
          </div>
        </Stack>
      </Container>
    );
  }

  function renderLoggedOut() {
    return (
      <>
        <Group justify="center" align="center" pt={{ base: 30, sm: 120 }}>
          <Stack w={{ base: '95vw', sm: 480 }} align="center">
            <Meta title="Login" />

            <Logo maw={200} title="Login" />
            <Paper radius="md" withBorder>
              <Stack p="md">
                <form onSubmit={form.onSubmit(handleSubmit)}>
                  {error && (
                    <Text c="red" size="sm" mb="md">
                      {error.message || 'An error occurred. Please try again.'}
                    </Text>
                  )}

                  <Stack gap="md">
                    <Group grow>
                      <TextInput
                        required
                        label="First Name"
                        placeholder="First Name"
                        {...form.getInputProps('firstName')}
                      />
                      <TextInput
                        required
                        label="Last Name"
                        placeholder="Last Name"
                        {...form.getInputProps('lastName')}
                      />
                    </Group>

                    <TextInput
                      required
                      label="Email"
                      placeholder="Email"
                      disabled
                      {...form.getInputProps('email')}
                    />

                    <PasswordInput
                      required
                      label="Password"
                      placeholder="Password"
                      {...form.getInputProps('password')}
                    />

                    <PasswordInput
                      required
                      label="Confirm Password"
                      placeholder="Confirm Password"
                      {...form.getInputProps('confirmPassword')}
                    />

                    <Button type="submit" loading={loading} fullWidth mt="md">
                      Create Account
                    </Button>
                  </Stack>
                </form>
                <Text size="xs">
                  Already have an account?{' '}
                  <Anchor component={Link} to="/login">
                    Login
                  </Anchor>
                </Text>
              </Stack>
            </Paper>
          </Stack>
        </Group>
      </>
    );
  }

  return (
    <>
      <Meta title="Accept Invite" />
      {isLoggedIn() ? renderLoggedIn() : renderLoggedOut()}
    </>
  );
}

export default AcceptInvite;
