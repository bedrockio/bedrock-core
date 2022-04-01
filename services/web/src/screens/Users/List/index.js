import React from 'react';
import { memoize } from 'lodash';
import { Link } from 'react-router-dom';
import {
  Table,
  Button,
  Message,
  Label,
  Divider,
  Loader,
  Confirm,
} from 'semantic';

import { formatDateTime } from 'utils/date';
import { request } from 'utils/api';
import screen from 'helpers/screen';
import { formatRoles } from 'utils/permissions';

import { HelpTip, Breadcrumbs, Layout } from 'components';
import { SearchProvider, Filters } from 'components/search';
import ErrorMessage from 'components/ErrorMessage';

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
          role: roles.map(({ id }) => id),
        },
      },
    });
  };

  fetchRoles = memoize(async (query) => {
    // No roles search route yet, so improvise.
    const { data } = await request({
      method: 'GET',
      path: `/1/users/roles`,
    });
    // TODO: ok maybe we finally need a non-id field for SearchDropdown
    const roles = [];
    for (let [key, val] of Object.entries(data)) {
      const { name } = val;
      if (!query?.keyword || RegExp(query.keyword, 'i').test(name)) {
        roles.push({
          id: key,
          name: val.name,
        });
      }
    }
    return { data: roles };
  });

  render() {
    return (
      <SearchProvider onDataNeeded={this.onDataNeeded}>
        {({ items: users, getSorted, setSort, reload, loading, error }) => {
          return (
            <React.Fragment>
              <Breadcrumbs active="Users" />
              <Layout horizontal center spread>
                <h1>Users</h1>
                <Layout.Group>
                  <Filters.Modal>
                    <Filters.Search
                      label="Search"
                      name="keyword"
                      placeholder="Enter name, email, or user id"
                    />
                    <Filters.Dropdown
                      multiple
                      label="Role"
                      name="roles"
                      onDataNeeded={this.fetchRoles}
                    />
                  </Filters.Modal>
                  <EditUser
                    trigger={<Button primary content="New User" icon="plus" />}
                    onSave={reload}
                  />
                </Layout.Group>
              </Layout>
              <ErrorMessage error={error} />
              {loading ? (
                <Loader active />
              ) : users.length === 0 ? (
                <Message>No users created yet</Message>
              ) : (
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
              <SearchProvider.Pagination />
            </React.Fragment>
          );
        }}
      </SearchProvider>
    );
  }
}
