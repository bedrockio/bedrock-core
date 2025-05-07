import UploadsField from 'components/form-fields/Uploads';
import ErrorMessage from 'components/ErrorMessage';
import SearchDropdown from 'components/SearchDropdown';

import allCountries from 'utils/countries';

import { useRequest } from 'utils/api';

import {
  Button,
  Stack,
  Grid,
  Group,
  TextInput,
  Textarea,
  Select,
  Fieldset,
} from '@mantine/core';

import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';

const countries = allCountries.map(({ countryCode, nameEn }) => ({
  value: countryCode,
  label: nameEn,
  key: countryCode,
}));

export default function ShopForm({
  shop,
  onSuccess = () => {},
  onCancel = () => {},
}) {
  const isUpdate = !!shop;

  const form = useForm({
    mode: 'controlled',
    initialValues: shop || {
      name: '',
      description: '',
      categories: [],
      images: [],
      address: {
        line1: '',
        line2: '',
        city: '',
        countryCode: '',
      },
    },
  });

  const editRequest = useRequest({
    ...(isUpdate
      ? {
          method: 'PATCH',
          path: `/1/shops/${shop.id}`,
        }
      : {
          method: 'POST',
          path: '/1/shops',
        }),
    manual: true,
    onSuccess: ({ data }) => {
      showNotification({
        title: isUpdate
          ? `${shop.name} was successfully updated.`
          : `${shop.name} was successfully created.`,
        color: 'green',
      });
      setTimeout(() => {
        onSuccess(data);
      }, 200);
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) =>
        editRequest.request({ body: values }),
      )}>
      <Stack>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack>
              <Fieldset legend="Shop Details" variant="unstyled">
                <Stack gap="xs">
                  <TextInput
                    required
                    label="Name"
                    {...form.getInputProps('name')}
                  />
                  <Textarea
                    label="Description"
                    {...form.getInputProps('description')}
                  />
                  <SearchDropdown
                    name="categories"
                    multiple
                    searchPath="/1/categories/search"
                    label="Categories"
                    {...form.getInputProps('categories')}
                  />
                </Stack>
              </Fieldset>

              <Fieldset legend="Address" variant="unstyled">
                <Stack gap="xs">
                  <TextInput
                    label="Address Line 1"
                    {...form.getInputProps('address.line1')}
                  />
                  <TextInput
                    label="Address Line 2 (Optional)"
                    {...form.getInputProps('address.line2')}
                  />
                  <TextInput
                    label="City/Town"
                    {...form.getInputProps('address.city')}
                  />
                  <Select
                    label="Country"
                    data={countries}
                    {...form.getInputProps('address.countryCode')}
                  />
                </Stack>
              </Fieldset>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Fieldset variant="unstyled" legend="Images">
              <Stack gap="xs">
                <UploadsField {...form.getInputProps('images')} />
              </Stack>
            </Fieldset>
          </Grid.Col>
        </Grid>
        <Group mt="md" gap="md">
          <ErrorMessage error={editRequest.error} mb="md" />
          <Button type="submit">
            {isUpdate ? 'Update' : 'Create New'} Shop
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
