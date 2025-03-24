import UploadsField from 'components/form-fields/Uploads.js';
import ErrorMessage from 'components/ErrorMessage.js';

import allCountries from 'utils/countries';

import { useRequest } from 'utils/api';

import {
  Button,
  Stack,
  Grid,
  Box,
  TextInput,
  Title,
  Select,
  PasswordInput,
} from '@mantine/core';

import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';

const countries = allCountries.map(({ countryCode, nameEn }) => ({
  value: countryCode,
  label: nameEn,
  key: countryCode,
}));

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' },
];

export default function UserForm({ user, onSuccess = () => {} }) {
  const isUpdate = !!user;

  const form = useForm({
    mode: 'controlled',
    initialValues: user || {
      name: '',
      email: '',
      role: 'user',
      avatar: null,
      password: '',
      address: {
        line1: '',
        line2: '',
        city: '',
        countryCode: '',
      },
    },
  });

  const editRequest = useRequest({
    ...(isUpdate
      ? {
          method: 'PATCH',
          path: `/1/users/${user.id}`,
        }
      : {
          method: 'POST',
          path: '/1/users',
        }),
    autoInvoke: false,
    onSuccess: ({ data }) => {
      showNotification({
        position: 'top-center',
        title: isUpdate
          ? `${data.name} was successfully updated.`
          : `${data.name} was successfully created.`,
        color: 'green',
      });
      setTimeout(() => {
        onSuccess(data);
      }, 200);
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) =>
        editRequest.invoke({ body: values }),
      )}>
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="xs">
            <TextInput required label="Name" {...form.getInputProps('name')} />
            <TextInput
              required
              label="Email"
              {...form.getInputProps('email')}
            />
            <Select
              label="Role"
              data={roleOptions}
              {...form.getInputProps('role')}
            />
            {!isUpdate && (
              <PasswordInput
                required
                label="Password"
                {...form.getInputProps('password')}
              />
            )}
            <Title order={4} mt="md">
              Address
            </Title>
            <TextInput
              label="Address Line 1"
              {...form.getInputProps('address.line1')}
            />
            <TextInput
              label="Address Line 2 (Optional)"
              {...form.getInputProps('address.line2')}
            />
            <TextInput
              label="City/Town"
              {...form.getInputProps('address.city')}
            />
            <Select
              label="Country"
              data={countries}
              {...form.getInputProps('address.countryCode')}
            />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <UploadsField
            label="Avatar"
            maxFiles={1}
            {...form.getInputProps('avatar')}
          />
        </Grid.Col>
      </Grid>
      <Box mt="md" gap="md">
        <ErrorMessage error={editRequest.error} mb="md" />
        <Button type="submit" onClick={() => scrollTo({ y: 0 })}>
          {isUpdate ? 'Update' : 'Create New'} User
        </Button>
      </Box>
    </form>
  );
}
