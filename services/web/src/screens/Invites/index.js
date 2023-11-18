import React from 'react';
import { Table, Button, Divider, Segment } from 'semantic';

import screen from 'helpers/screen';

import InviteUser from 'modals/InviteUser';
import {
  Search,
  Layout,
  LoadButton,
  Breadcrumbs,
  SearchFilters,
} from 'components';

import { formatDateTime } from 'utils/date';
import { request } from 'utils/api';

@screen
export default class Home extends React.Component {
  onDataNeeded = async (params) => {
    return await request({
      method: 'POST',
      path: '/1/invites/search',
      body: params,
    });
  };

  getFilterMapping() {
    return {
      status: {
        label: 'Status',
        multiple: true,
      },
      createdAt: {
        label: 'Created At',
        type: 'date',
        range: true,
      },
      keyword: {},
    };
  }

  render() {
    return (
      <Search.Provider
        filterMapping={this.getFilterMapping()}
        onDataNeeded={this.onDataNeeded}>
        {({ items, getSorted, setSort, reload }) => {
          return (
            <div>
              <Breadcrumbs active="Invites" />
              <Layout horizontal center spread>
                <h1>Invites</h1>
                <Layout.Group>
                  <InviteUser
                    size="tiny"
                    onSave={reload}
                    trigger={
                      <Button primary content="Invite User" icon="plus" />
                    }
                  />
                </Layout.Group>
              </Layout>

              <Divider hidden />

              <Segment>
                <Layout horizontal spread stackable>
                  <SearchFilters.Modal>
                    <SearchFilters.Dropdown
                      search
                      multiple
                      selection
                      name="status"
                      label="Status"
                      options={[
                        {
                          value: 'invited',
                          text: 'Invited',
                        },
                        {
                          value: 'Accepted',
                          text: 'Accepted',
                        },
                      ]}
                    />
                    <SearchFilters.DateRange
                      name="createdAt"
                      label="Created At"
                    />
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
                      <Table.HeaderCell>Email</Table.HeaderCell>
                      <Table.HeaderCell
                        onClick={() => setSort('status')}
                        sorted={getSorted('status')}>
                        Status
                      </Table.HeaderCell>
                      <Table.HeaderCell
                        width={3}
                        onClick={() => setSort('createdAt')}
                        sorted={getSorted('createdAt')}>
                        Invited At
                      </Table.HeaderCell>
                      <Table.HeaderCell textAlign="center">
                        Actions
                      </Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {items.map((item) => {
                      return (
                        <Table.Row key={item.id}>
                          <Table.Cell>{item.email}</Table.Cell>
                          <Table.Cell collapsing>{item.status}</Table.Cell>
                          <Table.Cell collapsing>
                            {formatDateTime(item.createdAt)}
                          </Table.Cell>
                          <Table.Cell textAlign="center">
                            <LoadButton
                              basic
                              icon="envelope"
                              title="Resend Invite"
                              onClick={async () => {
                                await request({
                                  method: 'POST',
                                  path: `/1/invites/${item.id}/resend`,
                                });
                                reload();
                              }}
                            />
                            <LoadButton
                              basic
                              icon="trash"
                              title="Delete"
                              onClick={async () => {
                                await request({
                                  method: 'DELETE',
                                  path: `/1/invites/${item.id}`,
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
              <Search.Pagination />
            </div>
          );
        }}
      </Search.Provider>
    );
  }
}
