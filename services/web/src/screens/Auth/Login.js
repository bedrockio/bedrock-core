import { Link, useNavigate } from '@bedrockio/router';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useSession } from 'stores/session';

import Federated from 'components/Auth/Federated';
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
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';

import { request } from 'utils/api';
import { AUTH_CHANNEL, AUTH_TYPE } from 'utils/env';

function login(values) {
  if (AUTH_TYPE === 'password') {
    return loginPassword(values);
  } else {
    return loginOtp(values);
  }
}

async function loginPassword(body) {
  return await request({
    method: 'POST',
    path: `/1/auth/password/login`,
    body,
  });
}

async function loginOtp(body) {
  return await request({
    method: 'POST',
    path: `/1/auth/otp/send`,
    body: {
      ...body,
      type: AUTH_TYPE,
      authChannel: AUTH_CHANNEL,
    },
  });
}

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password:
    AUTH_TYPE === 'password'
      ? z.string().min(1, 'Password is required')
      : z.string().optional(),
});

export default function PasswordLogin() {
  const navigate = useNavigate();
  const { authenticate } = useSession();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const [error, setError] = useState(null);
  const loading = form.formState.isSubmitting;

  function onAuthStart() {}

  function onAuthStop() {}

  function onAuthError(error) {
    setError(error);
  }

  async function onSubmit(values) {
    try {
      setError(null);

      const { data } = await login(values);
      const { token, challenge } = data;

      if (token) {
        const next = await authenticate(token);
        navigate(next);
      } else if (challenge) {
        navigate('/confirm-code', challenge);
      }
    } catch (error) {
      setError(error);
    }
  }

  return (
    <React.Fragment>
      <Meta title="Login" />
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Login</h1>
      <ErrorMessage error={error} />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-3">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {AUTH_TYPE === 'password' && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Password"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-muted-foreground mt-1 text-xs">
                    <Link
                      className="text-foreground no-underline hover:underline"
                      tabIndex={3}
                      to="/forgot-password">
                      Forgot password
                    </Link>
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <Button className="w-full" type="submit" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            Login
          </Button>

          <p className="text-muted-foreground text-xs">
            Don&apos;t have an account?{' '}
            <Link
              className="text-foreground font-medium no-underline hover:underline"
              tabIndex={4}
              to="/signup">
              Register
            </Link>
          </p>

          <Federated
            type="login"
            onAuthStop={onAuthStop}
            onAuthStart={onAuthStart}
            onAuthError={onAuthError}
          />
        </form>
      </Form>
    </React.Fragment>
  );
}
