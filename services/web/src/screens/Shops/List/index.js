import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Divider, Button, Message } from 'semantic';
import { formatDateTime } from 'utils/date';
import { request } from 'utils/api';
import { screen } from 'helpers';
import {
  Confirm,
  HelpTip,
  Breadcrumbs,
  SearchProvider,
  Layout,
} from 'components';

import Filters from 'modals/Filters';
import EditShop from 'modals/EditShop';

// --- Generator: list-imports
import { getData } from 'country-list';
const countries = getData().map(({ code, name }) => ({
  value: code,
  text: name,
  key: code,
}));
// --- Generator: end

@screen
export default class ShopList extends React.Component {
  onDataNeeded = async (params) => {
    const { category, ...rest } = params;
    return await request({
      method: 'POST',
      path: '/1/shops/search',
      body: {
        ...rest,
        ...(category && { categories: [category.id] }),
      },
    });
  };

  render() {
    return (
      <SearchProvider onDataNeeded={this.onDataNeeded}>
        {({
          items: shops,
          getSorted,
          setSort,
          filters,
          setFilters,
          reload,
        }) => {
          return (
            <React.Fragment>
              <Breadcrumbs active="Shops" />
              <Layout horizontal center spread>
                <h1>Shops</h1>
                <Layout.Group>
                  <Filters onSave={setFilters} filters={filters}>
                    {/* --- Generator: filters */}
                    <Filters.Text
                      label="Search"
                      name="keyword"
                      placeholder="Enter name or shop id"
                    />
                    <Filters.Dropdown
                      label="Country"
                      name="countryCode"
                      options={countries}
                      search
                    />
                    <Filters.Dropdown
                      label="Category"
                      name="category"
                      onDataNeeded={async () => {
                        const { data } = await request({
                          method: 'POST',
                          path: '/1/categories/search',
                          body: {
                            keyword: query,
                          },
                        });
                        return data;
                      }}
                    />
                    {/* --- Generator: end */}
                  </Filters>
                  <EditShop
                    trigger={<Button primary content="New Shop" icon="plus" />}
                    onSave={reload}
                  />
                </Layout.Group>
              </Layout>
              {shops.length === 0 ? (
                <Message>No shops created yet</Message>
              ) : (
                <Table celled sortable>
                  <Table.Header>
                    <Table.Row>
                      {/* --- Generator: list-header-cells */}
                      <Table.HeaderCell
                        width={3}
                        onClick={() => setSort('name')}
                        sorted={getSorted('name')}>
                        Name
                      </Table.HeaderCell>
                      <Table.HeaderCell width={3}>Description</Table.HeaderCell>
                      {/* --- Generator: end */}
                      <Table.HeaderCell
                        onClick={() => setSort('createdAt')}
                        sorted={getSorted('createdAt')}>
                        Created
                        <HelpTip
                          title="Created"
                          text="This is the date and time the shop was created."
                        />
                      </Table.HeaderCell>
                      <Table.HeaderCell textAlign="center">
                        Actions
                      </Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {shops.map((shop) => {
                      return (
                        <Table.Row key={shop.id}>
                          {/* --- Generator: list-body-cells */}
                          <Table.Cell>
                            <Link to={`/shops/${shop.id}`}>{shop.name}</Link>
                          </Table.Cell>
                          <Table.Cell>{shop.description}</Table.Cell>
                          {/* --- Generator: end */}
                          <Table.Cell>
                            {formatDateTime(shop.createdAt)}
                          </Table.Cell>
                          <Table.Cell textAlign="center" singleLine>
                            <EditShop
                              shop={shop}
                              trigger={<Button basic icon="edit" />}
                              onSave={reload}
                            />
                            <Confirm
                              negative
                              confirmText="Delete"
                              header={`Are you sure you want to delete "${shop.name}"?`}
                              content="All data will be permanently deleted"
                              trigger={<Button basic icon="trash" />}
                              onConfirm={async () => {
                                await request({
                                  method: 'DELETE',
                                  path: `/1/shops/${shop.id}`,
                                });
                                reload();
                              }}
                            />
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table>
              )}
            </React.Fragment>
          );
        }}
      </SearchProvider>
    );
  }
}
