import React from 'react';
import { memoize } from 'lodash';
import { Link } from 'react-router-dom';
import { Table, Button, Label, Divider, Confirm, Segment } from 'semantic';

import { formatDateTime } from 'utils/date';
import { request } from 'utils/api';
import screen from 'helpers/screen';
import { formatRoles } from 'utils/permissions';

import {
  HelpTip,
  Breadcrumbs,
  Layout,
  Search,
  SearchFilters,
} from 'components';

import EditUser from 'modals/EditUser';

@screen
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
      keyword: {},
    };
  }

  render() {
    return (
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
                    trigger={<Button primary content="New User" icon="plus" />}
                    onSave={reload}
                  />
                </Layout.Group>
              </Layout>

              <Segment>
                <Layout horizontal spread stackable>
                  <SearchFilters.Modal>
                    {/* --- Generator: filters */}

                    <SearchFilters.Dropdown
                      multiple
                      label="Role"
                      name="roles"
                      onDataNeeded={this.fetchRoles}
                    />

                    {/* --- Generator: end */}
                  </SearchFilters.Modal>

                  <Layout horizontal stackable center right>
                    <Search.Total />
                    <SearchFilters.Search
                      placeholder="Enter name, email, or user id"
                      name="keyword"
                    />
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
                            {formatRoles(user.roles).map((label) => (
                              <Label
                                key={label.key}
                                {...label}
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
                              trigger={<Button basic icon="edit" />}
                              onSave={reload}
                            />
                            <Confirm
                              negative
                              confirmButton="Delete"
                              header={`Are you sure you want to delete "${user.name}"?`}
                              content="All data will be permanently deleted"
                              trigger={<Button basic icon="trash" />}
                              onConfirm={async () => {
                                await request({
                                  method: 'DELETE',
                                  path: `/1/users/${user.id}`,
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
            </React.Fragment>
          );
        }}
      </Search.Provider>
    );
  }
}
