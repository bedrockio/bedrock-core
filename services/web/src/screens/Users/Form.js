import ErrorMessage from 'components/ErrorMessage.js';
import PhoneField from 'components/form-fields/Phone';

import { useRequest } from 'utils/api';

import {
  Button,
  Stack,
  Grid,
  Box,
  TextInput,
  PasswordInput,
  Checkbox,
  Select,
  Anchor,
  Text,
  Fieldset,
  MultiSelect,
} from '@mantine/core';

import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { useSession } from 'stores/session';

import Protected from 'components/Protected';

function parseUser(user) {
  if (!user) {
    return null;
  }
  return {
    ...user,
    globalRoles: user.roles
      .filter((r) => r.scope === 'global')
      .map((r) => r.role),
    organizationRoles: user.roles
      .filter((r) => r.scope === 'organization')
      .map((r) => r.role),
  };
}

function serializeUser({
  globalRoles = [],
  organizationRoles = [],
  ...user
} = {}) {
  if (!user) {
    return null;
  }
  return {
    ...user,
    roles: [
      ...(globalRoles || []).map((role) => ({
        role,
        scope: 'global',
      })),
      ...(organizationRoles || []).map((role) => ({
        role,
        scope: 'organization',
        scopeRef: user.organization.id,
      })),
    ],
  };
}

export default function UserForm({ user, onSuccess = () => {} }) {
  const isUpdate = !!user;

  const { hasAccess, organization } = useSession();

  const form = useForm({
    mode: 'controlled',
    initialValues: parseUser(user) || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      globalRoles: [],
      organizationRoles: [],
      isTester: false,
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
    manual: true,
    onSuccess: ({ data }) => {
      showNotification({
        position: 'top-right',
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

  const rolesRequest = useRequest({
    method: 'GET',
    path: '/1/users/roles',
  });

  return (
    <form
      onSubmit={form.onSubmit((values) =>
        editRequest.request({ body: serializeUser(values) }),
      )}>
      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack>
            <Fieldset legend="Basic Information" variant="unstyled">
              <Stack gap="xs">
                <TextInput
                  required
                  label="First Name"
                  {...form.getInputProps('firstName')}
                />
                <TextInput
                  required
                  label="Last Name"
                  {...form.getInputProps('lastName')}
                />
                <TextInput
                  required
                  label="Email"
                  {...form.getInputProps('email')}
                />
                <PhoneField
                  name="phone"
                  label="Phone Number"
                  {...form.getInputProps('phone')}
                />
                {!isUpdate && (
                  <PasswordInput
                    required
                    label="Password"
                    {...form.getInputProps('password')}
                  />
                )}
              </Stack>
            </Fieldset>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Fieldset legend="Roles & Flags" variant="unstyled">
            <Stack gap="xs">
              <Protected endpoint="users" permission="write">
                <MultiSelect
                  value={'superAdmin'}
                  label="Global Roles"
                  disabled={rolesRequest.loading}
                  multiple
                  description="Global scoped roles give a user permissions across all organizations."
                  data={rolesRequest?.data
                    .filter((c) => c.allowScopes.includes('global'))
                    .map((c) => {
                      return {
                        id: c.id,
                        value: c.id,
                        label: c.name,
                      };
                    })}
                  {...form.getInputProps('globalRoles')}
                />
              </Protected>
              {organization && (
                <MultiSelect
                  readOnly={
                    !hasAccess({ endpoint: 'users', permission: 'write' })
                  }
                  disabled={rolesRequest.loading}
                  label="Organization Roles"
                  description={
                    <>
                      <Text size="xs">
                        Organization scoped roles give a user permissions for a
                        single organization. You can only change the roles for
                        the current organization.{' '}
                        <Anchor size={'xs'}>View</Anchor>
                      </Text>
                    </>
                  }
                  multiple
                  data={
                    rolesRequest?.response?.data
                      .filter((c) => c.allowScopes.includes('organization'))
                      .map((c) => {
                        return {
                          value: c.id,
                          label: c.name,
                        };
                      }) || []
                  }
                  {...form.getInputProps('organizationRoles')}
                />
              )}

              <Checkbox
                label="Is Tester"
                {...form.getInputProps('isTester', { type: 'checkbox' })}
              />
            </Stack>
          </Fieldset>
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
