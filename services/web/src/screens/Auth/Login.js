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
import { Separator } from '@/components/ui/separator';

import { request } from 'utils/api';
import { formatPhone, normalizePhone } from 'utils/phone';

// The SMS channel delivers to a phone, so the login screen identifies by phone
// rather than email. Password login never uses a channel.
function usesPhone(auth) {
  return auth.type !== 'password' && auth.channel === 'sms';
}

function login(values, auth) {
  if (auth.type === 'password') {
    return loginPassword(values);
  } else {
    return loginOtp(values, auth);
  }
}

async function loginPassword(body) {
  return await request({
    method: 'POST',
    path: `/1/auth/password/login`,
    body: {
      email: body.email,
      password: body.password,
    },
  });
}

async function loginOtp(body, auth) {
  return await request({
    method: 'POST',
    path: `/1/auth/otp/send`,
    body: {
      ...(usesPhone(auth) ? { phone: body.phone } : { email: body.email }),
      type: auth.type,
      channel: auth.channel,
    },
  });
}

function getSchema(auth) {
  const usePhone = usesPhone(auth);
  return z.object({
    email: usePhone
      ? z.string().optional()
      : z.string().min(1, 'Email is required').email('Enter a valid email'),
    phone: usePhone
      ? z.string().min(1, 'Phone is required')
      : z.string().optional(),
    password:
      auth.type === 'password'
        ? z.string().min(1, 'Password is required')
        : z.string().optional(),
  });
}

export default function PasswordLogin() {
  const navigate = useNavigate();
  const { authenticate, meta } = useSession();
  const { auth } = meta;
  const usePhone = usesPhone(auth);

  const form = useForm({
    resolver: zodResolver(getSchema(auth)),
    defaultValues: {
      email: '',
      phone: '',
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

      const { data } = await login(values, auth);
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
      <div className="mb-4 flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Login</h1>
        <p className="text-muted-foreground text-sm">
          Sign in to access your dashboard.
        </p>
      </div>
      <ErrorMessage error={error} />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4">
          {usePhone ? (
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Phone"
                      autoComplete="tel"
                      value={formatPhone(field.value || '', 'us')}
                      onChange={(e) =>
                        field.onChange(normalizePhone(e.target.value))
                      }
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
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
          )}
          {auth.type === 'password' && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link
                      className="text-muted-foreground hover:text-foreground text-xs no-underline hover:underline"
                      tabIndex={3}
                      to="/forgot-password">
                      Forgot Password?
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput
                      placeholder="Password"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <Button className="w-full" type="submit" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            Login
          </Button>

          <Separator />

          <p className="text-muted-foreground text-center text-xs">
            Don&apos;t have an account?{' '}
            <Link
              className="text-foreground font-medium no-underline hover:underline"
              tabIndex={4}
              to="/signup">
              Sign up
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
