import { Link } from '@bedrockio/router';

import {
  Alert,
  Anchor,
  Button,
  Group,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';

import { useForm } from '@mantine/form';
import React, { useState } from 'react';

import Meta from 'components/Meta';

import { request } from 'utils/api';

export default function ForgotPassword() {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const handleSubmit = async (values) => {
    setError(null);
    setLoading(true);

    try {
      await request({
        method: 'POST',
        path: '/1/auth/password/request',
        body: values,
      });

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  const renderMessage = () => {
    return (
      <Alert title="Mail sent!" variant="light">
        Please follow the instructions in the email we sent to{' '}
        <b>{form.values.email}</b>
      </Alert>
    );
  };

  const renderForm = () => {
    return (
      <form onSubmit={form.onSubmit(handleSubmit)}>
        {error && (
          <Alert color="red" title="Error" mb="md">
            {error.message || 'Something went wrong'}
          </Alert>
        )}

        <TextInput
          required
          label="Email"
          placeholder="Your email"
          {...form.getInputProps('email')}
          mb="md"
        />

        <Button fullWidth type="submit" loading={loading} disabled={loading}>
          Reset password
        </Button>
      </form>
    );
  };

  return (
    <React.Fragment>
      <Meta title="Forgot Password" />
      <Title order={3}>Forgot Password</Title>
      <Stack mt="md">{success ? renderMessage() : renderForm()}</Stack>

      <Group mt="md" justify="space-between">
        <Anchor size="xs" component={Link} to="/login">
          Back to login
        </Anchor>
        <Anchor size="xs" component={Link} to="/signup">
          Don't have an account
        </Anchor>
      </Group>
    </React.Fragment>
  );
}
