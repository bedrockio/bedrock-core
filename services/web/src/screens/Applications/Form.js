import { Button, TextInput, Textarea, Stack, Fieldset } from '@mantine/core';
import { useForm } from '@mantine/form';
import ErrorMessage from 'components/ErrorMessage';
import { useRequest } from 'utils/api';

export default function ApplicationForm({ application, onSave, close }) {
  const isUpdate = !!application;

  const form = useForm({
    initialValues: {
      name: application?.name || '',
      description: application?.description || '',
    },
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
    },
  });

  const { loading, error, request } = useRequest({
    manual: true,
    method: isUpdate ? 'PATCH' : 'POST',
    path: isUpdate ? `/1/applications/${application.id}` : '/1/applications',
  });

  const onSubmit = async (values) => {
    try {
      await request({
        body: {
          ...values,
        },
      });
      onSave();
      close();
    } catch (e) {
      // Error handling is managed by useRequest
    }
  };

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        <ErrorMessage error={error} />
        <Fieldset legend="Application Details" variant="filled">
          <TextInput
            required
            label="Name"
            placeholder="Application name"
            {...form.getInputProps('name')}
          />

          <Textarea
            label="Description"
            placeholder="Application description"
            {...form.getInputProps('description')}
          />
        </Fieldset>

        <Button type="submit" loading={loading} disabled={loading}>
          {isUpdate ? 'Update' : 'Create'}
        </Button>
      </Stack>
    </form>
  );
}
