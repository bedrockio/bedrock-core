import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { showSuccessNotification } from 'helpers/notifications';

import ErrorMessage from 'components/ErrorMessage';
import Protected from 'components/Protected';
import Actions from 'components/form-fields/Actions';
import PhoneField from 'components/form-fields/Phone';
import RolesField from 'components/form-fields/Roles';
import UploadsField from 'components/form-fields/Uploads';
import { useRequest } from 'hooks/request';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';

import { request } from 'utils/api';

// UploadsField calls onChange as (name, value) when adding and as
// ({ name, value }) when removing — normalise both to the value.
function resolveUploadValue(...args) {
  if (args.length === 2) {
    return args[1];
  }
  return args[0]?.value;
}

const schema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  email: z.string().min(1, 'Email is required'),
  phone: z.string().optional().nullable(),
  image: z.any().optional(),
  roles: z.array(z.any()),
  isTester: z.boolean().optional(),
});

export default function UserForm(props) {
  const { user } = props;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      image: undefined,
      roles: [],
      isTester: false,
      ...user,
    },
  });

  const { run, loading, error } = useRequest(async (body) => {
    if (user) {
      const { data } = await request({
        method: 'PATCH',
        path: `/1/users/${user.id}`,
        body,
      });
      showSuccessNotification({
        message: 'User Updated',
      });
      props.onSuccess?.(data);
    } else {
      const { data } = await request({
        method: 'POST',
        path: '/1/users',
        body,
      });
      showSuccessNotification({
        message: 'User Created',
      });
      props.onSuccess?.(data);
    }
  });

  function onSubmit(fields) {
    run(fields);
  }

  const submitting = loading || form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4">
        <ErrorMessage error={error} />
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
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
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PhoneField
                      name="phone"
                      label="Phone Number"
                      value={field.value || ''}
                      onChange={(name, value) => field.onChange(value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <UploadsField
                      type="image"
                      name="image"
                      label="Image"
                      value={field.value}
                      onChange={(...args) =>
                        field.onChange(resolveUploadValue(...args))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Other</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Protected endpoint="users" permission="write">
              <FormField
                control={form.control}
                name="roles"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RolesField
                        name="roles"
                        scope="global"
                        label="Roles"
                        value={field.value}
                        onChange={(name, value) => field.onChange(value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Protected>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Flags</Label>
              <FormField
                control={form.control}
                name="isTester"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 py-2">
                    <FormControl>
                      <Switch
                        name="isTester"
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Tester</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        <Actions>
          <Button type="submit" disabled={submitting}>
            {submitting && <Spinner />}
            Submit
          </Button>
        </Actions>
      </form>
    </Form>
  );
}
