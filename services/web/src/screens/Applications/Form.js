import {
  Button,
  TextInput,
  Textarea,
  Stack,
  Fieldset,
  Grid,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import ErrorMessage from 'components/ErrorMessage';
import { useRequest } from 'utils/api';

export default function ApplicationForm({ application, onSave }) {
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
    } catch (e) {
      // Error handling is managed by useRequest
    }
  };

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <ErrorMessage error={error} />
          <Fieldset legend="Application Details" variant="filled">
            <Stack gap="md">
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
            </Stack>
          </Fieldset>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          {/* Add any additional fields or components here */}
        </Grid.Col>
      </Grid>
      <Button mt="md" type="submit" loading={loading} disabled={loading}>
        {isUpdate ? 'Update Application' : 'Create New Application'}
      </Button>
    </form>
  );
}
