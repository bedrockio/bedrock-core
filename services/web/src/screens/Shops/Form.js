import React from 'react';

import UploadsField from 'components/form-fields/Uploads.js';
import ErrorMessage from 'components/ErrorMessage.js';
import SearchDropdown from 'components/SearchDropdown.js';
import Meta from 'components/Meta.js';
import PageHeader from 'components/PageHeader.js';

import allCountries from 'utils/countries';

import { usePage } from 'stores/page';

const countries = allCountries.map(({ countryCode, nameEn }) => ({
  value: countryCode,
  label: nameEn,
  key: countryCode,
}));

import { useRequest } from 'utils/api';

import {
  Button,
  Stack,
  Grid,
  Box,
  TextInput,
  Textarea,
  Title,
  Select,
} from '@mantine/core';

import { useForm } from '@mantine/form';
import { li } from 'hast-util-to-mdast/lib/handlers/li';

export default function ShopForm({ shop }) {
  const isUpdate = shop ? true : false;

  const form = useForm({
    mode: 'controlled',
    initialValues: shop || {
      name: '',
      description: '',
      categories: [],

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
    autoInvoke: false,
    onSuccess: ({ data }) => {
      console.log(data);
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) =>
        editRequest.invoke({ body: values }),
      )}>
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="xs">
            <TextInput
              required
              type="text"
              label="Name"
              {...form.getInputProps('name')}
              //onChange={this.setField}
            />
            <Textarea
              label="Description"
              type="text"
              {...form.getInputProps('description')}
              //onChange={this.setField}
            />
            <SearchDropdown
              name="categories"
              multiple
              // onChange={this.setField}
              searchPath="/1/categories/search"
              label="Categories"
              {...form.getInputProps('categories')}
            />
            <Title>Address</Title>
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
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Box p="md">
            <UploadsField
              name="images"
              label="Images"
              value={shop?.images || []}
              //onChange={this.setField}
              onError={(error) => this.setState({ error })}
            />
          </Box>
        </Grid.Col>
      </Grid>
      <Box mt="md" gap="md">
        <ErrorMessage error={editRequest.error} mb="md" />
        <Button type="submit" onClick={() => scrollTo({ y: 0 })}>
          {isUpdate ? 'Update' : 'Create New'} Shop
        </Button>
      </Box>
    </form>
  );
}
