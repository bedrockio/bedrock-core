import { Link, useNavigate } from '@bedrockio/router';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { omit } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useSession } from 'stores/session';

import ErrorMessage from 'components/ErrorMessage';
import Meta from 'components/Meta';
import { useRequest } from 'hooks/request';

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
import { PasswordInput } from '@/components/ui/password-input';

import { request } from 'utils/api';
import { getUrlToken } from 'utils/token';

const schema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string(),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.confirmPassword === values.password, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

function AcceptInvite() {
  const { token, payload } = getUrlToken();
  const [error, setError] = useState(null);

  const { authenticate } = useSession();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
      email: payload?.sub || '',
    },
  });

  const loading = form.formState.isSubmitting;

  const { run: checkInvite, error: checkError } = useRequest({
    method: 'POST',
    path: '/1/invites/check',
    token,
  });

  useEffect(() => {
    checkInvite();
  }, []);

  async function handleSubmit(values) {
    try {
      setError(null);

      const { data } = await request({
        method: 'POST',
        path: '/1/invites/accept',
        token,
        body: omit(values, ['confirmPassword', 'email']),
      });

      const next = await authenticate(data.token);
      navigate(next);
    } catch (err) {
      setError(err);
    }
  }

  function render() {
    return (
      <React.Fragment>
        <Meta title="Login" />
        {renderSwitch()}
      </React.Fragment>
    );
  }
  function renderSwitch() {
    if (checkError) {
      return <ErrorMessage error={checkError} />;
    } else {
      return renderLoggedOut();
    }
  }

  function renderLoggedOut() {
    return (
      <div className="flex flex-col gap-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-3">
            <ErrorMessage error={error} />

            <div className="flex gap-3 [&>*]:flex-1">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First Name" {...field} />
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
                      <Input placeholder="Last Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" readOnly {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Password"
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
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Confirm Password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="mt-2 w-full" type="submit" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              Create Account
            </Button>
          </form>
        </Form>

        <p className="text-xs">
          Already have an account?{' '}
          <Link
            className="text-foreground no-underline hover:underline"
            to="/login">
            Login
          </Link>
        </p>
      </div>
    );
  }

  return render();
}

export default AcceptInvite;
