import { Link } from '@bedrockio/router';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import Meta from 'components/Meta';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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

import { request } from 'utils/api';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
});

export default function ForgotPassword() {
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });
  const loading = form.formState.isSubmitting;

  async function onSubmit(values) {
    setError(null);
    try {
      await request({
        method: 'POST',
        path: '/1/auth/password/request',
        body: values,
      });
      setEmail(values.email);
      setSuccess(true);
    } catch (err) {
      setError(err);
    }
  }

  return (
    <React.Fragment>
      <Meta title="Forgot Password" />
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Forgot Password</h1>

      {success ? (
        <Alert variant="success">
          <AlertTitle>Mail sent!</AlertTitle>
          <AlertDescription>
            Please follow the instructions in the email we sent to{' '}
            <b>{email}</b>
          </AlertDescription>
        </Alert>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-3">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error.message || 'Something went wrong'}
                </AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Your email"
                      autoComplete="email"
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
      )}

      <div className="text-muted-foreground mt-4 flex justify-between text-xs">
        <Link className="text-foreground no-underline hover:underline" to="/login">
          Back to login
        </Link>
        <Link
          className="text-foreground no-underline hover:underline"
          to="/signup">
          Don&apos;t have an account
        </Link>
      </div>
    </React.Fragment>
  );
}
