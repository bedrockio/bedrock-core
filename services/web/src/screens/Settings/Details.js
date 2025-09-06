import { Button, Fieldset, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { pick } from 'lodash';

import { useSession } from 'stores/session';

import ErrorMessage from 'components/ErrorMessage';
import Meta from 'components/Meta';
import PhoneField from 'components/form-fields/Phone';

import { useRequest } from 'utils/api';

import Menu from './Menu';

function Profile() {
  const { user, meta, updateUser } = useSession();

  const form = useForm({
    initialValues: {
      ...pick(user, ['id', 'firstName', 'lastName', 'phone', 'email']),
      notifications: meta.notifications.map((base) => {
        const config = user.notifications.find((c) => {
          return c.name === base.name;
        });
        return {
          ...base,
          ...config,
        };
      }),
    },
  });

  if (!user) {
    return null;
  }

  const saveRequest = useRequest({
    method: 'PATCH',
    path: `/1/users/me`,
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
    <Stack gap="md">
      <Meta title="Account Details" />
      <Menu />

      <ErrorMessage error={saveRequest.error} />
      <form
        onSubmit={form.onSubmit((values) => {
          saveRequest.request({
            body: {
              ...values,
            },
          });
        })}>
        <Fieldset legend="Profile" mb="md" variant="unstyled">
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
              <TextInput
                type="email"
                disabled
                label="Email"
                {...form.getInputProps('email')}
              />
            )}
          </Stack>
        </Fieldset>

        <Button
          type="submit"
          loading={saveRequest.loading}
          disabled={saveRequest.loading}>
          Update Profile
        </Button>
      </form>
    </Stack>
  );
}

export default Profile;
