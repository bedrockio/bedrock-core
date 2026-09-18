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
import { Separator } from '@/components/ui/separator';

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
      <div className="mb-4 flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Forgot Password</h1>
        <p className="text-muted-foreground text-sm">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <div className="flex flex-col gap-4">
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
              className="flex flex-col gap-4">
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

        <Separator />

        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <Link
            className="text-foreground no-underline hover:underline"
            to="/login">
            Back to Login
          </Link>
          <p>
            Don&apos;t have an account?{' '}
            <Link
              className="text-foreground font-medium no-underline hover:underline"
              to="/signup">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </React.Fragment>
  );
}
