import { zodResolver } from '@hookform/resolvers/zod';
import { pick } from 'lodash';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useSession } from 'stores/session';

import ErrorMessage from 'components/ErrorMessage';
import Meta from 'components/Meta';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

import { useRequest } from 'utils/api';
import { notify } from 'utils/notify';

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

const schema = z.object({}).passthrough();

function Notifications() {
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

  const notificationsValue = form.watch('notifications') || [];

  return (
    <div className="flex flex-col gap-4">
      <Meta title="Account Details" />
      <Menu />

      <ErrorMessage error={saveRequest.error} />
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Choose how you'd like to be notified on each channel.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-border flex flex-col divide-y">
            {notificationsValue.map((notification, index) => {
              const { name, label } = notification;
              return (
                <div
                  className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0"
                  key={name}>
                  <p className="text-sm font-medium">{label}</p>
                  <div className="flex flex-wrap gap-4">
                    {CHANNELS.map((channel) => {
                      const fieldName = `notifications.${index}.${channel.value}`;
                      const id = `${name}-${channel.value}`;
                      return (
                        <div
                          className="flex items-center gap-2"
                          key={channel.value}>
                          <Checkbox
                            id={id}
                            checked={!!form.watch(fieldName)}
                            onCheckedChange={(checked) => {
                              form.setValue(fieldName, checked === true);
                            }}
                          />
                          <Label htmlFor={id}>{channel.label}</Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button type="submit" disabled={saveRequest.loading}>
              {saveRequest.loading && <Spinner className="text-current" />}
              Save preferences
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

export default Notifications;
