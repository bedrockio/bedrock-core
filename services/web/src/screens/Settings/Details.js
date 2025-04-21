import { pick } from 'lodash';
import {
  Grid,
  TextInput,
  Button,
  Stack,
  Group,
  Fieldset,
  Text,
  Chip,
} from '@mantine/core';

import { useSession } from 'stores/session';
import { useForm } from '@mantine/form';

import Meta from 'components/Meta';

import ErrorMessage from 'components/ErrorMessage';
import PhoneField from 'components/form-fields/Phone';
import { useRequest } from 'utils/api';

import Menu from './Menu';
import { notifications } from '@mantine/notifications';

const CHANNELS = [
  {
    label: 'SMS',
    value: 'sms',
  },
  {
    label: 'Email',
    value: 'email',
  },
  {
    label: 'Push',
    value: 'push',
  },
];

/**
 * Profile settings component that allows users to update their profile information
 */
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
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Fieldset legend="Profile" mb="md" variant="unstyled">
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
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Fieldset legend="Notifications" variant="unstyled">
              {form.getValues().notifications.map((notification, index) => {
                const { name, label } = notification;
                return (
                  <Stack key={name}>
                    <Text size="sm">{label}</Text>
                    <Group>
                      {CHANNELS.map((channel) => {
                        return (
                          <Chip
                            key={channel.name}
                            label={channel.label}
                            size="xs"
                            {...form.getInputProps(
                              `notifications.${index}.${channel.value}`,
                              {
                                type: 'checkbox',
                              },
                            )}>
                            {channel.label}
                          </Chip>
                        );
                      })}
                    </Group>
                  </Stack>
                );
              })}
            </Fieldset>
          </Grid.Col>
        </Grid>

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
