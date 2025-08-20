import {
  Button,
  Checkbox,
  Fieldset,
  Grid,
  Group,
  NumberInput,
  Stack,
  TagsInput,
  TextInput,
  Textarea,
} from '@mantine/core';

import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';

import ErrorMessage from 'components/ErrorMessage';
import SearchDropdown from 'components/SearchDropdown';
import UploadsField from 'components/form-fields/Uploads';

import { useRequest } from 'utils/api';

function parseProduct(product) {
  return {
    ...product,
    // the DateTimePicker is very strict about getting an date object
    expiresAt: product?.expiresAt ? new Date(product.expiresAt) : null,
  };
}

export default function ProductForm({ product, shop, onSuccess = () => {} }) {
  const isUpdate = !!product;

  const form = useForm({
    initialValues: parseProduct(product) || {
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
            shop: shop?.id || form.values.shop?.id,
          },
        }),
    onSuccess: ({ data }) => {
      showNotification({
        title: isUpdate
          ? `${form.values.name} was successfully updated.`
          : `${form.values.name} was successfully created.`,
        color: 'green',
      });
      setTimeout(() => {
        onSuccess(data);
      }, 200);
    },
  });

  const handleSellingPointsChange = (values) => {
    form.setFieldValue('sellingPoints', values);
  };

  return (
    <form
      onSubmit={form.onSubmit((values) =>
        editRequest.request({ body: values }),
      )}>
      <Stack>
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Fieldset legend="Product Details" mb="md" variant="unstyled">
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
                  {...form.getInputProps('expiresAt')}
                  label="Expires At"
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
            </Fieldset>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Fieldset legend="Product Images" mb="md" variant="unstyled">
              <UploadsField
                label="Images"
                {...form.getInputProps('images')}
                onError={(error) => editRequest.setError(error)}
              />
            </Fieldset>
          </Grid.Col>
        </Grid>
        <ErrorMessage mb="md" error={editRequest?.error} />
        <Group>
          <Button
            type="submit"
            loading={editRequest.loading}
            disabled={editRequest.loading}>
            {isUpdate ? 'Update' : 'Create'} Product
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
