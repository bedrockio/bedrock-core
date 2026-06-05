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

import { useRequest } from 'utils/api';
import { AUTH_CHANNEL, AUTH_TYPE } from 'utils/env';
import { COUNTRIES, formatPhone } from 'utils/phone';

// Normalise a typed phone number to a prefixed value (ported from
// components/form-fields/Phone.js — that shared field migrates in Phase 4).
function normalizePhone(value, country = 'us') {
  let v = value
    .trim()
    .replace(/[ ()@.+-]/g, '')
    .replace(/^[01](\d)/, '$1')
    .replace(/[a-z]/gi, '');
  return v ? `${COUNTRIES[country].prefix}${v}` : '';
}

const schema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  phone: z.string().optional(),
  password:
    AUTH_TYPE === 'password'
      ? z.string().min(1, 'Password is required')
      : z.string().optional(),
});

export default function SignupPassword() {
  const navigate = useNavigate();
  const { authenticate } = useSession();
  const [error, setError] = useState(null);

  const signupRequest = useRequest({
    method: 'POST',
    path: '/1/signup',
    onSuccess: ({ data }) => {
      const { token, challenge } = data;
      if (token) {
        authenticate(token).then(() => {
          navigate('/onboard');
        });
      } else if (challenge) {
        navigate('/confirm-code', challenge);
      }
    },
    onError: (err) => {
      setError(err);
    },
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      password: '',
      email: '',
    },
  });
  const loading = form.formState.isSubmitting || signupRequest.loading;

  function onAuthError(error) {
    setError(error);
  }

  async function onSubmit(values) {
    setError(null);
    await signupRequest.request({
      body: {
        ...values,
        type: AUTH_TYPE,
        channel: AUTH_CHANNEL,
      },
    });
  }

  return (
    <React.Fragment>
      <Meta title="Signup" />
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Signup</h1>
      {signupRequest.error?.type !== 'validation' && (
        <ErrorMessage error={signupRequest.error || error} />
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-3">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="First Name"
                    autoComplete="given-name"
                    {...field}
                  />
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
                  <Input
                    placeholder="Last Name"
                    autoComplete="family-name"
                    {...field}
                  />
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
                      autoComplete="new-password"
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
            Signup
          </Button>

          <p className="text-muted-foreground text-xs">
            Already have an account?{' '}
            <Link
              className="text-foreground font-medium no-underline hover:underline"
              to="/login">
              Login
            </Link>
          </p>

          <Federated
            type="signup"
            onAuthStop={() => {}}
            onAuthStart={() => {}}
            onError={onAuthError}
          />
        </form>
      </Form>
    </React.Fragment>
  );
}
