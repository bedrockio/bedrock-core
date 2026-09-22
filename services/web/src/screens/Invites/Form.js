import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import ErrorMessage from 'components/ErrorMessage';
import { useModalContext } from 'components/ModalWrapper';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

import { useRequest } from 'utils/api';

const ROLES = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'admin', label: 'Admin' },
  { value: 'superAdmin', label: 'Super Admin' },
];

const schema = z.object({
  // Accept a comma/newline separated string and validate each address, passing
  // a clean array of emails on to the request.
  emails: z
    .string()
    .min(1, 'Enter at least one email address.')
    .transform((value) =>
      value
        .split(/[\s,]+/)
        .map((email) => email.trim())
        .filter(Boolean),
    )
    .pipe(
      z
        .array(z.string().email('Enter valid email addresses.'))
        .min(1, 'Enter at least one email address.'),
    ),
  role: z.enum(['viewer', 'admin', 'superAdmin']),
});

export default function InviteForm({ onSuccess }) {
  const { close } = useModalContext();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      emails: '',
      role: 'viewer',
    },
  });

  const { request, error } = useRequest({
    method: 'POST',
    path: '/1/invites',
    onSuccess: async () => {
      await onSuccess?.();
      close();
    },
  });

  async function onSubmit(body) {
    await request({ body });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4">
        <ErrorMessage error={error} />

        <FormField
          control={form.control}
          name="emails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Emails</FormLabel>
              <FormControl>
                <Textarea
                  rows="5"
                  placeholder="Enter email addresses separated by comma or new line."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose Role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Spinner />}
            Invite Members
          </Button>
        </div>
      </form>
    </Form>
  );
}
