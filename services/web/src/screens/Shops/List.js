import { Link } from '@bedrockio/router';

import {
  Anchor,
  Button,
  Group,
  Image,
  Loader,
  Stack,
  Table,
  Text,
} from '@mantine/core';

import ErrorMessage from 'components/ErrorMessage';
import PageHeader from 'components/PageHeader';
import Protected from 'components/Protected';
import Search from 'components/Search';
import SearchFilters from 'components/Search/Filters';

import { request } from 'utils/api';
import allCountries from 'utils/countries';
import { formatDateTime } from 'utils/date';
import { urlForUpload } from 'utils/uploads';

import Actions from './Actions';

const countries = allCountries.map(({ countryCode, nameEn }) => ({
  value: countryCode,
  label: nameEn,
  key: countryCode,
}));

export default function ShopList() {
  async function onDataNeeded(body) {
    return await request({
      method: 'POST',
      path: '/1/shops/search',
      body,
    });
  }

  async function fetchOwners(props) {
    const { data } = await request({
      method: 'POST',
      path: '/1/users/search',
      body: props,
    });
    return data;
  }

  async function fetchCategories(props) {
    const { data } = await request({
      method: 'POST',
      path: '/1/categories/search',
      body: props,
    });
    return data;
  }

  return (
    <>
      <Search.Provider onDataNeeded={onDataNeeded}>
        {({ items: shops, reload, error, loading }) => {
          return (
            <Stack>
              <PageHeader
                title="Shops"
                breadcrumbItems={[
                  {
                    href: '/',
                    title: 'Home',
                  },
                  {
                    title: 'Shops',
                  },
                ]}
                rightSection={
                  <>
                    <Search.Export filename="shops" />
                    <Protected endpoint="shops" permission="create">
                      <Button
                        component={Link}
                        variant="primary"
                        to="/shops/new">
                        New Shop
                      </Button>
                    </Protected>
                  </>
                }
              />

              <Group justify="space-between">
                <SearchFilters.Modal>
                  <SearchFilters.Select
                    data={countries}
                    search
                    name="country"
                    label="Country"
                  />
                  <SearchFilters.Select
                    search
                    onDataNeeded={fetchOwners}
                    name="owner"
                    label="Owner"
                  />
                  <SearchFilters.Select
                    search
                    multiple
                    onDataNeeded={fetchCategories}
                    name="categories"
                    label="Categories"
                  />
                  <SearchFilters.DateRange
                    label="Created At"
                    name="createdAt"
                  />
                </SearchFilters.Modal>
                {loading && <Loader size={'sm'} />}

                <Group>
                  <Search.Status />
                  <SearchFilters.Keyword />
                </Group>
              </Group>

              <ErrorMessage error={error} />

              <Table stickyHeader striped>
                <Table.Thead>
                  <Table.Tr>
                    <Search.Header name="name">Name</Search.Header>
                    <Search.Header width={60}>Image</Search.Header>
                    <Search.Header name="createdAt" width={280}>
                      Created
                    </Search.Header>
                    <Search.Header
                      width={100}
                      style={{
                        textAlign: 'right',
                      }}>
                      Actions
                    </Search.Header>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {shops.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={5}>
                        <Text p="md" fw="bold" ta="center">
                          No shops found.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                  {shops.map((shop) => {
                    return (
                      <Table.Tr key={shop.id}>
                        <Table.Td>
                          <Anchor
                            size="sm"
                            component={Link}
                            to={`/shops/${shop.id}`}>
                            {shop.name}
                          </Anchor>
                        </Table.Td>
                        <Table.Td>
                          {shop.images.length > 0 && (
                            <Image
                              radius={4}
                              h={40}
                              w={40}
                              fit
                              src={urlForUpload(shop.images[0], true)}
                            />
                          )}
                        </Table.Td>
                        <Table.Td>{formatDateTime(shop.createdAt)}</Table.Td>
                        <Table.Td justify="flex-end">
                          <Actions
                            compact
                            shop={shop}
                            reload={reload}
                            displayMode="list"
                          />
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
              <Search.Pagination />
            </Stack>
          );
        }}
      </Search.Provider>
    </>
  );
}
