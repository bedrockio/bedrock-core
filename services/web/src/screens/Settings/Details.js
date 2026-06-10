import { zodResolver } from '@hookform/resolvers/zod';
import { pick } from 'lodash';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useSession } from 'stores/session';

import ErrorMessage from 'components/ErrorMessage';
import Meta from 'components/Meta';
import PhoneField from 'components/form-fields/Phone';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

import { useRequest } from 'utils/api';
import { notify } from 'utils/notify';

import Menu from './Menu';

const schema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().optional(),
});

function Profile() {
  const { user, meta, updateUser } = useSession();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
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
      notify({
        title: 'Profile updated',
        message: 'Your profile has been successfully updated.',
        color: 'green',
      });
    },
  });

  function onSubmit(values) {
    saveRequest.request({
      body: {
        ...values,
      },
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Meta title="Account Details" />
      <Menu />

      <ErrorMessage error={saveRequest.error} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <fieldset className="mb-4">
            <legend className="mb-4 text-sm font-medium">Profile</legend>
            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {user.phone && (
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <PhoneField
                          disabled
                          label="Phone Number"
                          name={field.name}
                          value={field.value || ''}
                          onChange={(name, value) => field.onChange(value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {user.email && (
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" disabled {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </fieldset>

          <Button type="submit" disabled={saveRequest.loading}>
            {saveRequest.loading && <Spinner className="text-current" />}
            Update Profile
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default Profile;
