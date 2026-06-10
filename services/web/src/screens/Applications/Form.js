import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import ErrorMessage from 'components/ErrorMessage';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';

import { useRequest } from 'utils/api';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export default function ApplicationForm({ application, onSave }) {
  const isUpdate = !!application;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: application?.name || '',
      description: application?.description || '',
    },
  });

  const { loading, error, request } = useRequest({
    method: isUpdate ? 'PATCH' : 'POST',
    path: isUpdate ? `/1/applications/${application.id}` : '/1/applications',
  });

  async function onSubmit(values) {
    await request({
      body: {
        ...values,
      },
    });
    onSave();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <ErrorMessage error={error} />
            <Card>
              <CardContent>
                <p className="mb-4 font-semibold">Application Details</p>
                <div className="flex flex-col gap-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Application name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Application description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            {isUpdate && application.apiKey && (
              <div className="flex flex-col gap-2">
                <Label>API Key</Label>
                <code className="bg-muted rounded px-2 py-1 font-mono text-xs break-all">
                  {application.apiKey}
                </code>
              </div>
            )}
          </div>
        </div>
        <ErrorMessage error={error} />
        <div className="flex">
          <Button className="mt-4" type="submit" disabled={loading}>
            {loading && <Spinner />}
            {isUpdate ? 'Update Application' : 'Create New Application'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
