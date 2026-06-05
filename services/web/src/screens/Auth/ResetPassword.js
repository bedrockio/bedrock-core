import { Link, useNavigate } from '@bedrockio/router';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useSession } from 'stores/session';

import ErrorMessage from 'components/ErrorMessage';
import Meta from 'components/Meta';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PasswordInput } from '@/components/ui/password-input';

import { request } from 'utils/api';
import { getUrlToken } from 'utils/token';

const schema = z
  .object({
    password: z.string().min(1, 'Password is required'),
    repeat: z.string().min(1, 'Please repeat your password'),
  })
  .refine((d) => d.password === d.repeat, {
    message: 'Passwords do not match.',
    path: ['repeat'],
  });

export default function ResetPassword() {
  const navigate = useNavigate();
  const { authenticate } = useSession();
  const { token, payload } = getUrlToken();

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { password: '', repeat: '' },
  });
  const loading = form.formState.isSubmitting;

  async function onSubmit(values) {
    try {
      setError(null);
      const { data } = await request({
        method: 'POST',
        path: '/1/auth/password/update',
        token,
        body: { password: values.password },
      });
      setSuccess(true);
      navigate(await authenticate(data.token));
    } catch (err) {
      setError(err);
    }
  }

  if (!payload) {
    return (
      <React.Fragment>
        <Meta title="Reset Password" />
        <h1 className="text-destructive mb-2 text-2xl font-bold tracking-tight">
          No valid token found
        </h1>
        <p className="text-muted-foreground text-sm">
          Please ensure you either click the email link in the email or copy
          paste the link in full.
        </p>
      </React.Fragment>
    );
  }

  if (success) {
    return (
      <React.Fragment>
        <Meta title="Reset Password" />
        <h1 className="text-info mb-2 text-2xl font-bold tracking-tight">
          Your password has been changed!
        </h1>
        <p className="text-muted-foreground text-sm">
          Click here to open the{' '}
          <Link className="text-foreground no-underline hover:underline" to="/">
            Dashboard
          </Link>
        </p>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Meta title="Reset Password" />
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Reset Password</h1>
      <ErrorMessage error={error} />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="New Password"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="repeat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repeat Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Repeat Password"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full" type="submit" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            Reset Password
          </Button>
        </form>
      </Form>
    </React.Fragment>
  );
}
