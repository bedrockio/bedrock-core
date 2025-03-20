import React from 'react';
import { Link } from '@bedrockio/router';
import {
  Paper,
  Group,
  Title,
  Table,
  Button,
  Image,
  Divider,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import Meta from 'components/Meta';
import PageHeader from 'components/PageHeader';
import HelpTip from 'components/HelpTip';
import Layout from 'components/Layout';
import Search from 'components/Search';

import SearchFilters from 'components/Search/Filters';
import ErrorMessage from 'components/ErrorMessage';

import { formatDateTime } from 'utils/date';
import { request } from 'utils/api';

// --- Generator: list-imports
import allCountries from 'utils/countries';
import { urlForUpload } from 'utils/uploads';

const countries = allCountries.map(({ countryCode, nameEn }) => ({
  value: countryCode,
  text: nameEn,
  key: countryCode,
}));
// --- Generator: end

import Actions from './Actions';

export default function ShopList() {
  async function onDataNeeded(body) {
    return await request({
      method: 'POST',
      path: '/1/shops/search',
      body,
    });
  }

  // --- Generator: exclude
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
  // --- Generator: end

  function getFilterMapping() {
    return {
      // --- Generator: exclude
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
        type: 'date',
        range: true,
      },
      // --- Generator: end
      keyword: {},
    };
  }

  return (
    <>
      <Meta title="Shops" />
      <Search.Provider
        onDataNeeded={onDataNeeded}
        filterMapping={getFilterMapping()}>
        {({ items: shops, getSorted, setSort, reload, loading, error }) => {
          return (
            <React.Fragment>
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
                    <Button
                      component={Link}
                      to="/shops/new"
                      rightSection={<IconPlus size={14} />}>
                      New Shop
                    </Button>
                  </>
                }
              />

              <Paper mt="md" shadow="md" p="md" withBorder>
                <Group>
                  <Layout horizontal center spread stackable>
                    <SearchFilters.Modal>
                      {/* --- Generator: filters */}
                      <SearchFilters.Dropdown
                        options={countries}
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
                      {/* --- Generator: end */}
                    </SearchFilters.Modal>

                    <Layout horizontal stackable center right>
                      <Search.Total />
                      <SearchFilters.Keyword />
                    </Layout>
                  </Layout>
                </Group>

                <Search.Status />
                <ErrorMessage error={error} />

                {shops.length !== 0 && (
                  <Table stickyHeader striped mt="md">
                    <Table.Thead>
                      <Table.Tr>
                        {/* --- Generator: list-header-cells */}
                        <Table.Th
                          width="30%"
                          sorted={getSorted('name')}
                          onClick={() => setSort('name')}>
                          Name
                        </Table.Th>
                        <Table.Th>Image</Table.Th>
                        {/* --- Generator: end */}
                        <Table.Th
                          sorted={getSorted('createdAt')}
                          onClick={() => setSort('createdAt')}>
                          Created
                          <HelpTip
                            title="Created"
                            text="This is the date and time the shop was created."
                          />
                        </Table.Th>
                        <Table.Th width={200}>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {shops.map((shop) => {
                        return (
                          <Table.Tr key={shop.id}>
                            {/* --- Generator: list-body-cells */}
                            <Table.Td>
                              <Link to={`/shops/${shop.id}`}>{shop.name}</Link>
                            </Table.Td>
                            <Table.Td>
                              {shop.images.length > 0 && (
                                <Image
                                  h={50}
                                  w={50}
                                  objectFit="contain"
                                  src={urlForUpload(shop.images[0], true)}
                                />
                              )}
                            </Table.Td>
                            {/* --- Generator: end */}
                            <Table.Td>
                              {formatDateTime(shop.createdAt)}
                            </Table.Td>
                            <Table.Td textAlign="center">
                              <Actions shop={shop} reload={reload} />
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                )}
                <Divider my="md" />
                <Search.Pagination />
              </Paper>
            </React.Fragment>
          );
        }}
      </Search.Provider>
    </>
  );
}
