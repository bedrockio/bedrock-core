import { useNavigate } from '@bedrockio/router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import ErrorMessage from 'components/ErrorMessage';
import Actions from 'components/form-fields/Actions';
import ChipsField from 'components/form-fields/Chips';

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
import { Spinner } from '@/components/ui/spinner';

import { request } from 'utils/api';
import { notifySuccess } from 'utils/notify';

const CHANNEL_OPTIONS = [
  {
    label: 'Email',
    value: 'email',
  },
  {
    label: 'SMS',
    value: 'sms',
  },
  {
    label: 'Push',
    value: 'push',
  },
];

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  channels: z.array(z.string()).optional(),
});

export default function TemplateForm(props) {
  const { template, onSuccess } = props;

  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: template?.name || '',
      channels: template?.channels || [],
    },
  });

  const [error, setError] = useState(null);
  const loading = form.formState.isSubmitting;

  async function onSubmit(body) {
    try {
      setError(null);

      let result;
      if (template) {
        const { data } = await request({
          method: 'PATCH',
          path: `/1/templates/${template.id}`,
          body,
        });
        result = data;
      } else {
        const { data } = await request({
          method: 'POST',
          path: '/1/templates',
          body,
        });
        result = data;
      }

      notifySuccess({
        message: 'Added template',
      });

      onSuccess?.(result);
    } catch (error) {
      setError(error);
    }
  }

  function onCancelClick() {
    navigate.back();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent>
            <div className="flex flex-col gap-4">
              <ErrorMessage error={error} />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="channels"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ChipsField
                        name="channels"
                        label="Channels"
                        value={field.value || []}
                        options={CHANNEL_OPTIONS}
                        onChange={(name, value) => field.onChange(value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        <Actions>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={onCancelClick}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Spinner className="text-current" />}
            {template ? 'Update' : 'Create'}
          </Button>
        </Actions>
      </form>
    </Form>
  );
}
