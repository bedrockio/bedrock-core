import React from 'react';
import { Link } from '@bedrockio/router';
import {
  Paper,
  Group,
  Table,
  Button,
  Image,
  Divider,
  Tooltip,
  Anchor,
  Text,
} from '@mantine/core';
import { IconPlus, IconHelp } from '@tabler/icons-react';

import Meta from 'components/Meta';
import PageHeader from 'components/PageHeader';

import Layout from 'components/Layout';
import Search from 'components/Search';

import SearchFilters from 'components/Search/Filters';
import ErrorMessage from 'components/ErrorMessage';

import { formatDateTime } from 'utils/date';
import { request } from 'utils/api';

import allCountries from 'utils/countries';
import { urlForUpload } from 'utils/uploads';

const countries = allCountries.map(({ countryCode, nameEn }) => ({
  value: countryCode,
  text: nameEn,
  key: countryCode,
}));

import Actions from './Actions';
import SortableTh from 'components/Table/SortableTh';
import { Loader } from 'semantic-ui-react';

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
        type: 'date',
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
                <Group justify="space-between">
                  <Group>
                    <SearchFilters.Modal>
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
                    </SearchFilters.Modal>
                    {loading && <Loader size={'sm'} />}
                  </Group>

                  <Group>
                    <Search.Total />
                    <SearchFilters.Keyword />
                  </Group>
                </Group>

                <ErrorMessage error={error} />

                <Table stickyHeader striped mt="md">
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
                        <Group>
                          Created
                          <Tooltip
                            withArrow
                            multiline={true}
                            label="This is the date and time the item was created.">
                            <IconHelp size={14} />
                          </Tooltip>
                        </Group>
                      </SortableTh>
                      <Table.Th width={120}>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
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
                          <Table.Td align="center">
                            <Group gap="md">
                              <Actions shop={shop} reload={reload} />
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>

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
