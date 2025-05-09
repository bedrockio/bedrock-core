import React from 'react';
import { memoize } from 'lodash';
import { Link } from '@bedrockio/router';
import { Table, Button, Label, Divider, Segment } from 'semantic';

import HelpTip from 'components/HelpTip';
import Breadcrumbs from 'components/Breadcrumbs';
import Layout from 'components/Layout';
import Search from 'components/Search';
import SearchFilters from 'components/Search/Filters';

import EditUser from 'modals/EditUser';

import { formatDateTime } from 'utils/date';
import { request } from 'utils/api';
import { formatRoles } from 'utils/permissions';

import Actions from '../Actions';
import Meta from 'components/Meta';

export default class UserList extends React.Component {
  onDataNeeded = async (params) => {
    const { roles, ...rest } = params;
    return await request({
      method: 'POST',
      path: '/1/users/search',
      body: {
        ...rest,
        roles: roles && {
          role: roles.map((role) => role.id || role),
        },
      },
    });
  };

  fetchRoles = memoize(async (query = {}) => {
    // No roles search route yet, so improvise.
    const { data } = await request({
      method: 'GET',
      path: `/1/users/roles`,
    });

    const roles = [];

    // TODO: ok maybe we finally need a non-id field for SearchDropdown

    for (let [key, val] of Object.entries(data)) {
      const { name } = val;
      if (!query?.keyword || RegExp(query.keyword, 'i').test(name)) {
        roles.push({
          key: key,
          id: key,
          name: val.name,
        });
      }
    }
    return { data: roles };
  });

  getFilterMapping() {
    return {
      roles: {
        label: 'Role',
        multiple: true,
        getDisplayValue: async (ids) => {
          const { data: allRoles } = await this.fetchRoles();

          return allRoles
            .filter((role) => ids.includes(role.id))
            .map((role) => role.name)
            .join(', ');
        },
      },
      isTester: {
        label: 'Is Tester',
        type: 'boolean',
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
      <>
        <Meta title="Users" />
        <Search.Provider
          onDataNeeded={this.onDataNeeded}
          filterMapping={this.getFilterMapping()}>
          {({ items: users, getSorted, setSort, reload }) => {
            return (
              <React.Fragment>
                <Breadcrumbs active="Users" />
                <Layout horizontal center spread>
                  <h1>Users</h1>
                  <Layout.Group>
                    <Search.Export filename="users" />
                    <EditUser
                      trigger={
                        <Button primary content="New User" icon="plus" />
                      }
                      onSave={reload}
                    />
                  </Layout.Group>
                </Layout>

                <Segment>
                  <Layout horizontal spread stackable>
                    <SearchFilters.Modal>
                      <SearchFilters.Dropdown
                        multiple
                        label="Role"
                        name="roles"
                        onDataNeeded={this.fetchRoles}
                      />

                      <SearchFilters.Checkbox
                        label="Is Tester"
                        name="isTester"
                      />

                      <SearchFilters.DateRange
                        label="Created At"
                        name="createdAt"
                      />
                    </SearchFilters.Modal>

                    <Layout horizontal stackable center right>
                      <Search.Total />
                      <SearchFilters.Keyword placeholder="Enter name, email, phone, or user id" />
                    </Layout>
                  </Layout>
                </Segment>

                <Search.Status />

                {users.length !== 0 && (
                  <Table celled sortable>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell
                          width={3}
                          onClick={() => setSort('lastName')}
                          sorted={getSorted('lastName')}>
                          Name
                        </Table.HeaderCell>
                        <Table.HeaderCell
                          onClick={() => setSort('email')}
                          sorted={getSorted('email')}>
                          Email
                        </Table.HeaderCell>
                        <Table.HeaderCell
                          onClick={() => setSort('phoneNumber')}
                          sorted={getSorted('phoneNumber')}>
                          Phone Number
                        </Table.HeaderCell>
                        <Table.HeaderCell
                          onClick={() => setSort('roles')}
                          sorted={getSorted('roles')}>
                          Roles
                        </Table.HeaderCell>
                        <Table.HeaderCell
                          onClick={() => setSort('createdAt')}
                          sorted={getSorted('createdAt')}>
                          Joined
                          <HelpTip
                            title="Joined"
                            text="This is the date and time the user was created."
                          />
                        </Table.HeaderCell>
                        <Table.HeaderCell textAlign="center">
                          Actions
                        </Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {users.map((user) => {
                        return (
                          <Table.Row key={user.id}>
                            <Table.Cell>
                              <Link to={`/users/${user.id}`}>{user.name}</Link>
                            </Table.Cell>
                            <Table.Cell>{user.email}</Table.Cell>
                            <Table.Cell>
                              {user.phoneNumber || 'N / A'}
                            </Table.Cell>
                            <Table.Cell>
                              {formatRoles(user.roles).map((label) => (
                                <Label
                                  {...label}
                                  key={label.key}
                                  style={{
                                    marginBottom: '3px',
                                    marginLeft: 0,
                                    marginRight: '5px',
                                  }}
                                />
                              ))}
                            </Table.Cell>
                            <Table.Cell>
                              {formatDateTime(user.createdAt)}
                            </Table.Cell>
                            <Table.Cell textAlign="center" singleLine>
                              <EditUser
                                user={user}
                                trigger={
                                  <Button
                                    basic
                                    title="Edit"
                                    icon="pen-to-square"
                                  />
                                }
                                onSave={reload}
                              />
                              <Actions user={user} reload={reload} />
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
      </>
    );
  }
}
