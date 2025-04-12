import { pick } from 'lodash';
import {
  Grid,
  TextInput,
  Button,
  Stack,
  Group,
  Space,
  Fieldset,
  Text,
  Chip,
  Radio,
  useMantineColorScheme,
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
  const { setColorScheme, colorScheme } = useMantineColorScheme();

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
    <>
      <Meta title="Account Details" />
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
            <Fieldset variant="filled" legend="Profile" mb="md">
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
            <Fieldset variant="filled" legend="Notifications">
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
            <Fieldset variant="filled" legend="Appearance" mt="md">
              <Stack mt="xs">
                <Radio
                  checked={colorScheme === 'light'}
                  label="Light Mode"
                  onClick={() => {
                    setColorScheme('light');
                  }}
                />
                <Radio
                  checked={colorScheme === 'dark'}
                  label="Dark Mode"
                  onClick={() => {
                    setColorScheme('dark');
                  }}
                />
                <Radio
                  checked={colorScheme === 'auto'}
                  label="Sync with System"
                  onClick={() => {
                    setColorScheme('auto');
                  }}
                />
              </Stack>
            </Fieldset>
          </Grid.Col>
        </Grid>
        <Group justify="flex-start" mt="md">
          <Button
            type="submit"
            loading={saveRequest.loading}
            disabled={saveRequest.loading}>
            Update Details
          </Button>
        </Group>
      </form>
    </>
  );
}

export default Profile;
