import React from 'react';
import { Table, Button, Divider, Confirm, Segment, Form } from 'semantic';

import { formatDateTime } from 'utils/date';
import { request } from 'utils/api';
import screen from 'helpers/screen';
import { HelpTip, Breadcrumbs, Layout } from 'components';
import { SearchProvider, Filters, Status, Export } from 'components/search';
// --- Generator: list-imports
import { Link } from 'react-router-dom';
import allCountries from 'utils/countries';

const countries = allCountries.map(({ countryCode, nameEn }) => ({
  value: countryCode,
  text: nameEn,
  key: countryCode,
}));

// --- Generator: end

import EditShop from 'modals/EditShop';

@screen
export default class ShopList extends React.Component {
  onDataNeeded = (body) => {
    return request({
      method: 'POST',
      path: '/1/shops/search',
      body,
    });
  };

  fetchOwners = async (name) => {
    const { data } = await request({
      method: 'POST',
      path: '/1/users/search',
      body: {
        name,
      },
    });
    return data;
  };

  render() {
    return (
      <SearchProvider onDataNeeded={this.onDataNeeded}>
        {({ items: shops, getSorted, setSort, reload, registerFilter }) => {
          return (
            <React.Fragment>
              <Breadcrumbs active="Shops" />
              <Layout horizontal center spread>
                <h1>Shops</h1>
                <Layout.Group>
                  <Export filename="shops" />
                  <EditShop
                    trigger={<Button primary content="New Shop" icon="plus" />}
                    onSave={reload}
                  />
                </Layout.Group>
              </Layout>
              <Segment>
                <Layout horizontal center spread stackable>
                  <Layout horizontal>
                    <Filters.Modal>
                      {/* --- Generator: filters */}

                      <Filters.Dropdown
                        name="country"
                        label="Country"
                        options={countries}
                        search
                        {...registerFilter('country', (id) => {
                          return [
                            'Country',
                            countries.find((c) => c.value === id).text,
                          ];
                        })}
                      />
                      <Filters.Dropdown
                        {...registerFilter(
                          {
                            name: 'Owner',
                            label: 'Owner',
                            onDataNeeded: this.fetchOwners,
                            search: true,
                          },
                          (id) =>
                            this.fetchOwners({ id }).then(
                              (data) => data[0].name
                            )
                        )}
                        search
                      />

                      {/* --- Generator: end */}
                    </Filters.Modal>
                    <Filters.Overview />
                  </Layout>

                  <Layout.Group>
                    <Filters.Search
                      name="keyword"
                      placeholder="Enter name or id"
                    />
                  </Layout.Group>
                </Layout>
              </Segment>
              <Status />
              {shops.length !== 0 && (
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
                              confirmButton="Delete"
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
              <Divider hidden />
              <SearchProvider.Pagination />
            </React.Fragment>
          );
        }}
      </SearchProvider>
    );
  }
}
