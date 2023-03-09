import React from 'react';
import { Table, Image, Button, Divider, Segment } from 'semantic';
import { Link } from 'react-router-dom';

import { formatDateTime } from 'utils/date';
import { urlForUpload } from 'utils/uploads';
import { request } from 'utils/api';
import screen from 'helpers/screen';
import {
  HelpTip,
  Breadcrumbs,
  Layout,
  Search,
  SearchFilters,
} from 'components';
import EditShop from 'modals/EditShop';

// --- Generator: list-imports
import allCountries from 'utils/countries';

import Actions from '../Actions';
const countries = allCountries.map(({ countryCode, nameEn }) => ({
  value: countryCode,
  text: nameEn,
  key: countryCode,
}));
// --- Generator: end

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
        {({ items, getSorted, setSort, reload }) => {
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
                    <SearchFilters.Search name="keyword" />
                  </Layout>
                </Layout>
              </Segment>

              <Search.Status />

              {items.length !== 0 && (
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
                    {items.map((item) => {
                      const [image] = item.images;
                      return (
                        <Table.Row key={item.id}>
                          {/* --- Generator: list-body-cells */}
                          <Table.Cell>
                            <Link to={`/shops/${item.id}`}>{item.name}</Link>
                          </Table.Cell>
                          {/* --- Generator: end */}
                          <Table.Cell>
                            {image && (
                              <Image
                                size="tiny"
                                src={urlForUpload(image, true)}
                              />
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            {formatDateTime(item.createdAt)}
                          </Table.Cell>
                          <Table.Cell textAlign="center" singleLine>
                            <EditShop
                              shop={item}
                              trigger={<Button basic icon="pen-to-square" />}
                              onSave={reload}
                            />
                            <Actions item={item} reload={reload} />
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
