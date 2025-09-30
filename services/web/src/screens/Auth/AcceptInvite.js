import { Link, useNavigate } from '@bedrockio/router';

import {
  Anchor,
  Button,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';

import { useForm } from '@mantine/form';
import { omit } from 'lodash';
import React, { useEffect, useState } from 'react';

import { useSession } from 'stores/session';

import ErrorMessage from 'components/ErrorMessage';
import Meta from 'components/Meta';
import { useRequest } from 'hooks/request';

import { request } from 'utils/api';
import { getUrlToken } from 'utils/token';

function AcceptInvite() {
  const { token, payload } = getUrlToken();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { authenticate } = useSession();
  const navigate = useNavigate();

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

  const { run: checkInvite, error: checkError } = useRequest({
    method: 'POST',
    path: '/1/invites/check',
    token,
  });

  useEffect(() => {
    checkInvite();
  }, []);

  async function handleSubmit(values) {
    try {
      setError(null);
      setLoading(true);

      const { data } = await request({
        method: 'POST',
        path: '/1/invites/accept',
        token,
        body: omit(values, ['confirmPassword', 'email']),
      });

      const next = await authenticate(data.token);
      navigate(next);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }

  function render() {
    return (
      <React.Fragment>
        <Meta title="Login" />
        {renderSwitch()}
      </React.Fragment>
    );
  }
  function renderSwitch() {
    if (checkError) {
      return <ErrorMessage error={checkError} />;
    } else {
      return renderLoggedOut();
    }
  }

  function renderLoggedOut() {
    return (
      <Stack gap="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <ErrorMessage error={error} />

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
            readOnly
            {...form.getInputProps('email')}
          />

          <PasswordInput
            required
            label="Password"
            placeholder="Password"
            autoComplete="new-password"
            {...form.getInputProps('password')}
          />

          <PasswordInput
            required
            label="Confirm Password"
            placeholder="Confirm Password"
            autoComplete="new-password"
            {...form.getInputProps('confirmPassword')}
          />

          <Button type="submit" loading={loading} fullWidth mt="md">
            Create Account
          </Button>
        </form>

        <Text size="xs">
          Already have an account?{' '}
          <Anchor component={Link} to="/login">
            Login
          </Anchor>
        </Text>
      </Stack>
    );
  }

  return render();
}

export default AcceptInvite;
