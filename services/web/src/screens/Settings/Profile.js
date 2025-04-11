import { useState } from 'react';
import { pick } from 'lodash';
import {
  Grid,
  TextInput,
  Button,
  Alert,
  Stack,
  Group,
  Space,
  Fieldset,
} from '@mantine/core';

import { useSession } from 'stores/session';
import { useForm } from '@mantine/form';

import Meta from 'components/Meta';

import ErrorMessage from 'components/ErrorMessage';
import PhoneField from 'components/form-fields/Phone';
import { request, useRequest } from 'utils/api';

import Menu from './Menu';
import { notifications } from '@mantine/notifications';

/**
 * Profile settings component that allows users to update their profile information
 */
function Profile() {
  const { user, updateUser } = useSession();

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

  const saveRequest = useRequest({
    method: 'PATCH',
    path: `/1/users/me`,
    manual: true,
    onSuccess: ({ data }) => {
      updateUser(data);
      notifications.show({
        title: 'Profile updated',
        message: 'Your profile has been successfully updated.',
        color: 'green',
      });
    },
  });

  return (
    <>
      <Meta title="Profile" />
      <Menu />
      <Space h="md" />
      <ErrorMessage error={saveRequest.error} />
      <form
        onSubmit={form.onSubmit((values) => {
          saveRequest.request({
            body: {
              ...values,
            },
          });
        })}>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Fieldset legend="Profile" mb="md">
              <Stack>
                <TextInput
                  label="First Name"
                  {...form.getInputProps('firstName')}
                />
                <TextInput
                  label="Last Name"
                  {...form.getInputProps('lastName')}
                />
                {user.phone && (
                  <PhoneField
                    disabled
                    label="Phone Number"
                    {...form.getInputProps('phone')}
                  />
                )}
                {user.email && (
                  <TextInput
                    type="email"
                    disabled
                    label="Email"
                    {...form.getInputProps('email')}
                  />
                )}
              </Stack>
            </Fieldset>
          </Grid.Col>
        </Grid>
        <Group justify="flex-start" mt="md">
          <Button
            type="submit"
            loading={saveRequest.loading}
            disabled={saveRequest.loading}>
            Save
          </Button>
        </Group>
      </form>
    </>
  );
}

export default Profile;
