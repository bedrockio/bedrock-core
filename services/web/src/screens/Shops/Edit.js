import React from 'react';

import UploadsField from 'components/form-fields/Uploads';
import CountriesField from 'components/form-fields/Countries';
import AddressField from 'components/form-fields/Address';
import ErrorMessage from 'components/ErrorMessage';
import SearchDropdown from 'components/SearchDropdown';

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
} from '@mantine/core';

import { useForm } from '@mantine/form';

import Meta from 'components/Meta';

import PageHeader from 'components/PageHeader';

import { request } from 'utils/api';

const items = [
  { title: 'Dashboard', href: '/' },
  { title: 'Settings', href: '/settings' },
].map((item, index) => (
  <Anchor href={item.href} key={index}>
    {item.title}
  </Anchor>
));

export default function EditShop() {
  const { error, loading } = {};
  const isUpdate = false;
  const shop = {};

  const form = useForm({
    mode: 'controlled',
    initialValues: {
      categories: [],
    },
  });

  return (
    <>
      <>
        <Meta title="Edit Shop" />
      </>
      <Container fluid>
        <Stack gap="lg">
          <PageHeader title="Edit Shop" breadcrumbItems={items} />
          <Paper shadow="md" p="md" withBorder>
            <form>
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Stack gap="xs">
                    <ErrorMessage error={error} />
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
                    <CountriesField
                      label="Country"
                      {...form.getInputProps('country')}
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

                    <AddressField
                      value={shop.address}
                      //onChange={this.setField}
                      name="address"
                      autoComplete="off"
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
              <Box mt="md">
                <Button type="submit" onClick={() => scrollTo({ y: 0 })}>
                  {isUpdate ? 'Update' : 'Create New'} Shop
                </Button>
              </Box>
            </form>
          </Paper>
        </Stack>
      </Container>
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
