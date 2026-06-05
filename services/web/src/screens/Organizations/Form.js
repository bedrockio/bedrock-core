import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import ErrorMessage from 'components/ErrorMessage';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

import { useRequest } from 'utils/api';
import { notify } from 'utils/notify';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
});

/**
 * Organization form component for creating or updating an organization
 *
 * @param {Object} props - Component props
 * @param {Object} props.organization - Organization object for editing (optional)
 * @param {Function} props.onSave - Callback function after successful save
 * @param {Function} props.close - Function to close the modal
 */
function OrganizationForm({ organization, onSuccess = () => {} }) {
  const isUpdate = !!organization;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: organization || {
      name: '',
    },
  });

  const editRequest = useRequest({
    ...(isUpdate
      ? {
          method: 'PATCH',
          path: `/1/organizations/${organization.id}`,
        }
      : {
          method: 'POST',
          path: '/1/organizations',
        }),
    onSuccess: ({ data }) => {
      notify({
        title: isUpdate
          ? `${form.getValues('name')} was successfully updated.`
          : `${form.getValues('name')} was successfully created.`,
        color: 'green',
      });
      onSuccess(data);
    },
  });

  function onSubmit(values) {
    return editRequest.request({ body: values });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
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
            </CardContent>
          </Card>
        </div>
        <div className="mt-4 flex flex-col gap-4">
          <ErrorMessage error={editRequest.error} />
          <Button type="submit" disabled={editRequest.loading}>
            {editRequest.loading && <Spinner />}
            {isUpdate ? 'Update' : 'Create'} Organization
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default OrganizationForm;
