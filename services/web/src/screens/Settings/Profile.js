import { useState } from 'react';
import { pick } from 'lodash';
import {
  Paper,
  TextInput,
  Button,
  Alert,
  Stack,
  Group,
  Space,
} from '@mantine/core';

import { useSession } from 'stores/session';
import { useForm } from '@mantine/form';

import Meta from 'components/Meta';

import ErrorMessage from 'components/ErrorMessage';
import PhoneField from 'components/form-fields/Phone';
import EmailField from 'components/form-fields/Email';

import { request } from 'utils/api';

import Menu from './Menu';

/**
 * Profile settings component that allows users to update their profile information
 */
function Profile() {
  const { user, updateUser } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const form = useForm({
    initialValues: pick(user, [
      'id',
      'firstName',
      'lastName',
      'phone',
      'email',
    ]),
  });

  if (!user) {
    return null;
  }

  /**
   * Handles form submission to update user profile
   * @param {Object} values - Form values
   */
  async function handleSubmit(values) {
    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const { data } = await request({
        method: 'PATCH',
        path: `/1/users/me`,
        body: values,
      });

      updateUser(data);
      setLoading(false);
      setMessage('Settings Updated');
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }

  return (
    <>
      <Meta title="Profile" />
      <Menu />
      <Space h="md" />
      <ErrorMessage error={error} />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        {message && (
          <Alert color="green" title="Success" mb="md">
            {message}
          </Alert>
        )}
        <Paper p="md" withBorder>
          <Stack>
            <TextInput
              label="First Name"
              {...form.getInputProps('firstName')}
            />
            <TextInput label="Last Name" {...form.getInputProps('lastName')} />
            {user.phone && (
              <PhoneField
                disabled
                label="Phone Number"
                {...form.getInputProps('phone')}
              />
            )}
            {user.email && (
              <EmailField
                disabled
                label="Email"
                {...form.getInputProps('email')}
              />
            )}
          </Stack>
        </Paper>
        <Group justify="flex-end" mt="md">
          <Button type="submit" loading={loading} disabled={loading}>
            Save
          </Button>
        </Group>
      </form>
    </>
  );
}

export default Profile;
