import React from 'react';
/* eslint-disable-next-line */
import { Table, Button, Divider, Segment } from 'semantic';
import { Link } from 'react-router-dom';

import screen from 'helpers/screen';

import HelpTip from 'components/HelpTip';
import Layout from 'components/Layout';
import Search from 'components/Search';
import Breadcrumbs from 'components/Breadcrumbs';
import SearchFilters from 'components/Search/Filters';

import EditShop from 'modals/EditShop';

import { formatDateTime } from 'utils/date';
import { request } from 'utils/api';

// --- Generator: list-imports
/* eslint-disable-next-line */
import { Image } from 'semantic';
import allCountries from 'utils/countries';
import { urlForUpload } from 'utils/uploads';

const countries = allCountries.map(({ countryCode, nameEn }) => ({
  value: countryCode,
  text: nameEn,
  key: countryCode,
}));
// --- Generator: end

import Actions from '../Actions';

@screen
export default class ShopList extends React.Component {
  onDataNeeded = (body) => {
    return request({
      method: 'POST',
      path: '/1/shops/search',
      body,
    });
  };

  // --- Generator: exclude
  fetchOwners = async (props) => {
    const { data } = await request({
      method: 'POST',
      path: '/1/users/search',
      body: props,
    });
    return data;
  };
  // --- Generator: end

  getFilterMapping() {
    return {
      // --- Generator: exclude
      country: {
        label: 'Country',
        getDisplayValue: (id) => countries.find((c) => c.value === id)?.text,
      },
      owner: {
        label: 'Owner',
        getDisplayValue: async (id) => {
          const owners = await this.fetchOwners({
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

  render() {
    return (
      <Search.Provider
        onDataNeeded={this.onDataNeeded}
        filterMapping={this.getFilterMapping()}>
        {({ items: shops, getSorted, setSort, reload }) => {
          return (
            <React.Fragment>
              <Breadcrumbs active="Shops" />
              <Layout horizontal center spread>
                <h1>Shops</h1>
                <Layout.Group>
                  <Search.Export filename="shops" />
                  <EditShop
                    trigger={<Button primary content="New Shop" icon="plus" />}
                    onSave={reload}
                  />
                </Layout.Group>
              </Layout>

              <Segment>
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
                      onDataNeeded={(name) => this.fetchOwners({ name })}
                      search
                      name="owner"
                      label="Owner"
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
              </Segment>

              <Search.Status />

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
                      <Table.HeaderCell>Image</Table.HeaderCell>
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
                          <Table.Cell>
                            {shop.images.length > 1 && (
                              <Image
                                size="tiny"
                                src={urlForUpload(shop.images[0], true)}
                              />
                            )}
                          </Table.Cell>
                          {/* --- Generator: end */}
                          <Table.Cell>
                            {formatDateTime(shop.createdAt)}
                          </Table.Cell>
                          <Table.Cell textAlign="center" singleLine>
                            <EditShop
                              shop={shop}
                              trigger={<Button basic icon="pen-to-square" />}
                              onSave={reload}
                            />
                            <Actions shop={shop} reload={reload} />
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table>
              )}
              <Divider hidden />
              <Search.Pagination />
            </React.Fragment>
          );
        }}
      </Search.Provider>
    );
  }
}
