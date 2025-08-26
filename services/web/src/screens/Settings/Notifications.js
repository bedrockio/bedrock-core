import { Button, Chip, Fieldset, Group, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { pick } from 'lodash';

import { useSession } from 'stores/session';

import ErrorMessage from 'components/ErrorMessage';
import Meta from 'components/Meta';

import { useRequest } from 'utils/api';

import Menu from './Menu';

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

function Notifications() {
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
        <Fieldset legend="Notifications" mb="md" variant="unstyled">
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

export default Notifications;
