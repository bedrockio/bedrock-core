import { useState } from 'react';
import {
  Button,
  Group,
  Paper,
  Stack,
  Title,
  Text,
  Anchor,
  PasswordInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Link, useNavigate } from '@bedrockio/router';

import { useSession } from 'stores/session';
import ErrorMessage from 'components/ErrorMessage';
import Logo from 'components/Logo';

import { request } from 'utils/api';
import { getUrlToken } from 'utils/token';
import Meta from 'components/Meta';

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

  function renderTokenMissing() {
    return (
      <Paper mt="md" w="100%" p="lg" radius="md" withBorder>
        <Stack>
          <Title order={3} color="red">
            No valid token found
          </Title>
          <Text>
            Please ensure you either click the email link in the email or copy
            paste the link in full.
          </Text>
        </Stack>
      </Paper>
    );
  }

  function renderSuccessMessage() {
    return (
      <Paper mt="md" w="100%" p="lg" radius="md" withBorder>
        <Stack>
          <Title order={3} c="blue">
            Your password has been changed!
          </Title>
          <Text>
            Click here to open the{' '}
            <Anchor component={Link} to="/">
              Dashboard
            </Anchor>
          </Text>
        </Stack>
      </Paper>
    );
  }

  function renderForm() {
    return (
      <Paper mt="md" w="100%" p="lg" radius="md" withBorder>
        <Stack gap="md">
          <Title order={3}>Reset Password</Title>
          <ErrorMessage error={error} />
          <form onSubmit={form.onSubmit(onSubmit)}>
            <Stack gap="md">
              <PasswordInput
                required
                label="New Password"
                placeholder="New Password"
                {...form.getInputProps('password')}
              />

              <PasswordInput
                required
                label="Repeat Password"
                placeholder="Repeat Password"
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
        </Stack>
      </Paper>
    );
  }

  function renderBody() {
    if (!payload) {
      return renderTokenMissing();
    } else if (success) {
      return renderSuccessMessage();
    } else {
      return renderForm();
    }
  }

  return (
    <Group justify="center" align="center" pt={{ base: 30, sm: 120 }}>
      <Stack w={{ base: '95vw', sm: 480 }} align="center">
        <Meta title="Reset Password" />
        <Logo maw={200} title="Reset Password" />
        {renderBody()}
      </Stack>
    </Group>
  );
}
