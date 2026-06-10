import { Redirect } from '@bedrockio/router';
import { zodResolver } from '@hookform/resolvers/zod';
import { pick, startCase } from 'lodash';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useSession } from 'stores/session';

import ErrorMessage from 'components/ErrorMessage';
import Logo from 'components/Logo';
import Meta from 'components/Meta';
import PhoneField from 'components/form-fields/Phone';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { request } from 'utils/api';

const FIELDS = [
  {
    name: 'phone',
    required: true,
  },
];

const schema = z.object({
  email: z.string().optional(),
  phone: z.string().min(1, `${startCase('phone')} is required.`),
});

export default function OnboardScreen() {
  const { user, updateUser } = useSession();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: pick(
      user,
      FIELDS.map((f) => f.name),
    ),
  });

  const [error, setError] = useState(null);
  const loading = form.formState.isSubmitting;

  function validateFields(user) {
    for (let field of FIELDS) {
      if (field.required && !user[field.name]) {
        throw new Error(`${startCase(field.name)} is required.`);
      }
    }
  }

  function isValidUser(user) {
    try {
      validateFields(user);
      return true;
    } catch {
      return false;
    }
  }

  async function onSubmit(body) {
    try {
      setError(null);

      validateFields(body);

      const { data } = await request({
        method: 'PATCH',
        path: '/1/users/me',
        body,
      });

      updateUser(data);
    } catch (error) {
      setError(error);
    }
  }

  if (isValidUser(user)) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <Meta title="Tell Us More" />
      <Logo />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <Card className="p-4 shadow-sm">
            <CardContent className="flex flex-col gap-4 p-0">
              {error?.type !== 'validation' && <ErrorMessage error={error} />}
              {!user.email && (
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="email" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {!user.phone && (
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <PhoneField
                          name="phone"
                          value={field.value || ''}
                          onChange={(name, value) => field.onChange(value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <Button
                className="w-full"
                type="submit"
                size="lg"
                disabled={loading}>
                {loading && <Loader2 className="size-4 animate-spin" />}
                Continue
              </Button>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
