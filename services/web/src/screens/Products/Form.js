import ErrorMessage from 'components/ErrorMessage.js';
import UploadsField from 'components/form-fields/Uploads.js';
import CurrencyField from 'components/form-fields/Currency';
import SearchDropdown from 'components/form-fields/SearchDropdown';

import { useRequest } from 'utils/api';

import {
  Button,
  Stack,
  Grid,
  Box,
  TextInput,
  Textarea,
  Title,
  Checkbox,
  MultiSelect,
  NumberInput,
  TagsInput,
} from '@mantine/core';

import { useForm } from '@mantine/form';
import { DateTimePicker } from '@mantine/dates';
import { showNotification } from '@mantine/notifications';

export default function ProductForm({
  product,
  shop,
  onSave = () => {},
  onClose = () => {},
}) {
  const isUpdate = !!product;

  const form = useForm({
    mode: 'controlled',
    initialValues: product || {
      name: '',
      description: '',
      isFeatured: false,
      priceUsd: '',
      expiresAt: null,
      sellingPoints: [],
      images: [],
      shop: shop || null,
    },
  });

  const editRequest = useRequest({
    ...(isUpdate
      ? {
          method: 'PATCH',
          path: `/1/products/${product.id}`,
        }
      : {
          method: 'POST',
          path: '/1/products',
          body: {
            // --- Generator: refs
            shop: shop?.id || form.values.shop?.id,
            // --- Generator: end
          },
        }),
    autoInvoke: false,
    onSuccess: ({ data }) => {
      showNotification({
        position: 'top-center',
        title: isUpdate
          ? `${form.values.name} was successfully updated.`
          : `${form.values.name} was successfully created.`,
        color: 'green',
      });
      setTimeout(() => {
        onSave(data);
        onClose();
      }, 200);
    },
  });

  const handleSellingPointsChange = (values) => {
    form.setFieldValue('sellingPoints', values);
  };

  return (
    <form
      onSubmit={form.onSubmit((values) =>
        editRequest.invoke({ body: values }),
      )}>
      <Box p="md">
        <Title order={2}>
          {isUpdate ? `Edit "${form.values.name}"` : 'New Product'}
        </Title>

        <Grid mt="md">
          <Grid.Col span={{ base: 12, md: 6 }}>
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
              <Checkbox
                label="Is Featured"
                {...form.getInputProps('isFeatured', { type: 'checkbox' })}
              />
              <NumberInput
                prefix="$"
                thousandSeparator=","
                allowDecimal={true}
                decimalScale={2}
                fixedDecimalScale
                label="Price"
                {...form.getInputProps('priceUsd')}
              />

              <DateTimePicker
                label="Expires At"
                {...form.getInputProps('expiresAt')}
              />
              <TagsInput
                label="Selling Points"
                data={
                  form.values.sellingPoints?.map((value) => ({
                    value,
                    label: value,
                  })) || []
                }
                value={form.values.sellingPoints || []}
                onChange={handleSellingPointsChange}
                creatable
                searchable
                getCreateLabel={(query) => `+ Add ${query}`}
                onCreate={(query) => {
                  const newValue = query.trim();
                  form.setFieldValue('sellingPoints', [
                    ...(form.values.sellingPoints || []),
                    newValue,
                  ]);
                  return newValue;
                }}
              />
              {!shop && (
                <SearchDropdown
                  clearable
                  required
                  name="shop"
                  label="Shop"
                  searchPath="/1/shops/search"
                  placeholder="Search Shops"
                  {...form.getInputProps('shop')}
                />
              )}
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <UploadsField
              label="Images"
              {...form.getInputProps('images')}
              onError={(error) => editRequest.setError(error)}
            />
          </Grid.Col>
        </Grid>

        <Box mt="md" gap="md">
          <ErrorMessage mb="md" error={editRequest.error} />
          <Button
            type="submit"
            loading={editRequest.loading}
            disabled={editRequest.loading}>
            {isUpdate ? 'Update' : 'Create'} Product
          </Button>
        </Box>
      </Box>
    </form>
  );
}
