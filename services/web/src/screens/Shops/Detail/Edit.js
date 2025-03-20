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

import { request, useRequest } from 'utils/api';

import {
  Button,
  Container,
  Anchor,
  Stack,
  Grid,
  Box,
  TextInput,
  Paper,
  Textarea,
  Title,
  Select,
} from '@mantine/core';

import { useForm } from '@mantine/form';

export default function EditShop() {
  const { shop } = usePage();

  const isUpdate = false;

  const form = useForm({
    mode: 'controlled',
    initialValues: shop,
  });

  const editRequest = useRequest({
    ...(shop
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
    <>
      <>
        <Meta title="Edit Shop" />
      </>

      <Stack gap="lg">
        <PageHeader
          title="Edit Shop"
          breadcrumbItems={[
            { title: 'Home', href: '/' },
            { title: 'Shops', href: '/shops' },
            { title: shop.name },
          ]}
        />
        <Paper shadow="md" p="md" withBorder>
          <form
            onSubmit={form.onSubmit((values) => editRequest.invoke(values))}>
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
                    {...form.getInputProps('address.countryCode')}
                    label="Country"
                    data={countries}
                  />
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Box p="md">
                  <UploadsField
                    name="images"
                    label="Images"
                    value={shop.images || []}
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
        </Paper>
      </Stack>
    </>
  );
}

class OldEditShop extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      loading: false,
      shop: props.shop || {},
    };
  }

  isUpdate() {
    return !!this.props.shop;
  }

  onSubmit = async () => {
    this.setState({
      error: null,
      loading: true,
    });
    const { shop } = this.state;
    try {
      if (this.isUpdate()) {
        await request({
          method: 'PATCH',
          path: `/1/shops/${shop.id}`,
          body: shop,
        });
      } else {
        await request({
          method: 'POST',
          path: '/1/shops',
          body: shop,
        });
      }
      this.props.close();
      this.props.onSave();
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };
}
