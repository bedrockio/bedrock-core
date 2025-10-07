import { Link, useNavigate } from '@bedrockio/router';

import {
  Anchor,
  Button,
  Paper,
  PasswordInput,
  Stack,
  Text,
  Title,
} from '@mantine/core';

import { useForm } from '@mantine/form';
import React, { useState } from 'react';

import { useSession } from 'stores/session';

import ErrorMessage from 'components/ErrorMessage';
import Meta from 'components/Meta';

import { request } from 'utils/api';
import { getUrlToken } from 'utils/token';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { authenticate } = useSession();
  const { token, payload } = getUrlToken();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const form = useForm({
    initialValues: {
      password: '',
      repeat: '',
    },
    validate: {
      repeat: (value, values) =>
        value !== values.password ? 'Passwords do not match.' : null,
    },
  });

  async function onSubmit(values) {
    try {
      setLoading(true);
      setError(null);

      const { data } = await request({
        method: 'POST',
        path: '/1/auth/password/update',
        token,
        body: {
          password: values.password,
        },
      });

      setSuccess(true);
      setLoading(false);
      navigate(await authenticate(data.token));
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }

  function render() {
    return (
      <React.Fragment>
        <Meta title="Reset Password" />
        {renderSwitch()}
      </React.Fragment>
    );
  }

  function renderSwitch() {
    if (!payload) {
      return renderTokenMissing();
    } else if (success) {
      return renderSuccessMessage();
    } else {
      return renderForm();
    }
  }

  function renderTokenMissing() {
    return (
      <React.Fragment>
        <Title order={3} color="red">
          No valid token found
        </Title>
        <Text>
          Please ensure you either click the email link in the email or copy
          paste the link in full.
        </Text>
      </React.Fragment>
    );
  }

  function renderSuccessMessage() {
    return (
      <React.Fragment>
        <Title order={3} c="blue">
          Your password has been changed!
        </Title>
        <Text>
          Click here to open the{' '}
          <Anchor component={Link} to="/">
            Dashboard
          </Anchor>
        </Text>
      </React.Fragment>
    );
  }

  function renderForm() {
    return (
      <React.Fragment>
        <Title order={3} mb="md">
          Reset Password
        </Title>
        <ErrorMessage error={error} />
        <form onSubmit={form.onSubmit(onSubmit)}>
          <Stack gap="md">
            <PasswordInput
              required
              label="New Password"
              placeholder="New Password"
              autoComplete="new-password"
              {...form.getInputProps('password')}
            />

            <PasswordInput
              required
              label="Repeat Password"
              placeholder="Repeat Password"
              autoComplete="new-password"
              {...form.getInputProps('repeat')}
            />

            <Button
              fullWidth
              variant="filled"
              loading={loading}
              disabled={loading}
              type="submit">
              Reset Password
            </Button>
          </Stack>
        </form>
      </React.Fragment>
    );
  }

  return render();
}
