import { useRequest } from 'utils/api';

import { Fieldset, Stack, Grid, TextInput, Box, Button } from '@mantine/core';

import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import ErrorMessage from 'components/ErrorMessage';

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
    mode: 'controlled',
    initialValues: organization || {
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
      showNotification({
        title: isUpdate
          ? `${form.values.name} was successfully updated.`
          : `${form.values.name} was successfully created.`,
        color: 'green',
      });
      onSuccess(data);
    },
  });

  return (
    <>
      <form
        onSubmit={form.onSubmit((values) =>
          editRequest.request({ body: values }),
        )}>
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md">
              <Fieldset variant="unstyled" legend="Organization Details">
                <Stack gap="xs">
                  <TextInput
                    required
                    label="Name"
                    {...form.getInputProps('name')}
                  />
                </Stack>
              </Fieldset>
            </Stack>
          </Grid.Col>
        </Grid>
        <Box mt="md" gap="md">
          <ErrorMessage mb="md" error={editRequest.error} />
          <Button
            type="submit"
            loading={editRequest.loading}
            disabled={editRequest.loading}>
            {isUpdate ? 'Update' : 'Create'} Organization
          </Button>
        </Box>
      </form>
    </>
  );
}

export default OrganizationForm;
