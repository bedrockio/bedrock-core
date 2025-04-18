import { Link } from '@bedrockio/router';
import {
  Group,
  Table,
  Button,
  Image,
  Divider,
  Tooltip,
  Anchor,
  Text,
  Loader,
} from '@mantine/core';
import { IconPlus, IconHelp } from '@tabler/icons-react';
import Protected from 'components/Protected';

import PageHeader from 'components/PageHeader';

import Search from 'components/Search';

import SearchFilters from 'components/Search/Filters';
import ErrorMessage from 'components/ErrorMessage';

import { formatDateTime } from 'utils/date';
import { request } from 'utils/api';

import allCountries from 'utils/countries';
import { urlForUpload } from 'utils/uploads';

const countries = allCountries.map(({ countryCode, nameEn }) => ({
  value: countryCode,
  label: nameEn,
  key: countryCode,
}));

import Actions from './Actions';
import SortableTh from 'components/Table/SortableTh';

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

  function getFilterMapping() {
    return {
      country: {
        label: 'Country',
        getDisplayValue: (id) => countries.find((c) => c.value === id)?.text,
      },
      owner: {
        label: 'Owner',
        getDisplayValue: async (id) => {
          const owners = await fetchOwners({
            ids: [id],
          });
          return owners[0].name;
        },
      },
      createdAt: {
        label: 'Created At',
        //type: 'date',
        range: true,
      },
      keyword: {},
    };
  }

  return (
    <>
      <Search.Provider
        onDataNeeded={onDataNeeded}
        filterMapping={getFilterMapping()}>
        {({ items: shops, getSorted, setSort, reload, error, loading }) => {
          return (
            <>
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
                        variant="default"
                        to="/shops/new"
                        rightSection={<IconPlus size={14} />}>
                        New Shop
                      </Button>
                    </Protected>
                  </>
                }
              />

              <Group mt="lg" justify="space-between">
                <SearchFilters.Modal>
                  <SearchFilters.Dropdown
                    data={countries}
                    search
                    name="country"
                    label="Country"
                  />
                  <SearchFilters.Dropdown
                    search
                    onDataNeeded={fetchOwners}
                    name="owner"
                    label="Owner"
                  />
                  <SearchFilters.Dropdown
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
                  <Search.Total />
                  <SearchFilters.Keyword />
                </Group>
              </Group>

              <ErrorMessage mt="md" error={error} />

              <Table.ScrollContainer minWidth={300} mt="md">
                <Table stickyHeader striped>
                  <Table.Thead>
                    <Table.Tr>
                      {/* --- Generator: list-header-cells */}
                      <SortableTh
                        sorted={getSorted('name')}
                        onClick={() => setSort('name')}>
                        Name
                      </SortableTh>
                      <Table.Th width={60}>Image</Table.Th>
                      {/* --- Generator: end */}
                      <SortableTh
                        sorted={getSorted('createdAt')}
                        onClick={() => setSort('createdAt')}
                        width={280}>
                        <Group>Created</Group>
                      </SortableTh>
                      <Table.Th
                        width={100}
                        style={{
                          textAlign: 'right',
                        }}>
                        Actions
                      </Table.Th>
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
                          {/* --- Generator: list-body-cells */}
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
                            <Actions compact shop={shop} reload={reload} />
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
                <Divider mb="md" />
                <Search.Pagination />
              </Table.ScrollContainer>
            </>
          );
        }}
      </Search.Provider>
    </>
  );
}
