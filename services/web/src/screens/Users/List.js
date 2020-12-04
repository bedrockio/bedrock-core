import React from 'react';
import { Link } from 'react-router-dom';
import { formatDateTime } from 'utils/date';
import { request } from 'utils/api';
import { Layout } from 'components/Layout';
import { screen } from 'helpers';

import { Confirm } from 'components/Semantic';
import SearchProvider from 'components/SearchProvider';
import HelpTip from 'components/HelpTip';

import Filters from 'modals/Filters';
import EditUser from 'modals/EditUser';

import {
  Container,
  Header,
  Table,
  Message,
  Button,
} from 'semantic-ui-react';

@screen
export default class UserList extends React.Component {

  onDataNeeded = async (params) => {
    return await request({
      method: 'POST',
      path: '/1/users/search',
      body: params,
    });
  };

  render() {
    return (
      <SearchProvider onDataNeeded={this.onDataNeeded}>
        {({ items, getSorted, setSort, filters, setFilters, reload }) => {
          return (
            <Container>
              <div style={{float: 'right', marginTop: '-5px'}}>
              </div>
              <Header as="h2">
                <Layout horizontal center spread>
                  Users
                  <Layout.Group>
                    <Filters onSave={setFilters} filters={filters}>
                      <Filters.Dropdown
                        name="role"
                        label="Role"
                        options={[
                          {
                            text: 'User',
                              value: 'user',
                          },
                          {
                            text: 'Admin',
                            value: 'admin',
                          }
                        ]}
                      />
                    </Filters>
                    <EditUser
                      trigger={
                        <Button
                          primary
                          content="New User"
                          icon="plus"
                        />
                      }
                      onSave={reload}
                    />
                  </Layout.Group>
                </Layout>
              </Header>
              {items.length === 0 ? (
                <Message>No users added yet</Message>
              ) : (
                <Table celled sortable>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell
                        width={3}
                        onClick={() => setSort('name')}
                        sorted={getSorted('name')}>
                        Name
                      </Table.HeaderCell>
                      <Table.HeaderCell
                        width={3}
                        onClick={() => setSort('email')}
                        sorted={getSorted('email')}>
                        Email
                      </Table.HeaderCell>
                      <Table.HeaderCell
                        width={3}
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
                    {items.map((item) => {
                      return (
                        <Table.Row key={item.id}>
                          <Table.Cell>
                            <Link to={`/users/${item.id}`}>
                              {item.name}
                            </Link>
                          </Table.Cell>
                          <Table.Cell>{item.email}</Table.Cell>
                          <Table.Cell>
                            {item.roles
                                .map((r) => r.slice(0, 1).toUpperCase() + r.slice(1))
                                .join(', ')}
                          </Table.Cell>
                          <Table.Cell>{formatDateTime(item.createdAt)}</Table.Cell>
                          <Table.Cell textAlign="center">
                            <EditUser
                              user={item}
                              trigger={
                                <Button
                                  style={{ marginLeft: '20px' }}
                                  basic
                                  icon="edit"
                                />
                              }
                              onSave={reload}
                            />
                            <Confirm
                              negative
                              confirmText="Delete"
                              header={`Are you sure you want to delete "${item.name}"?`}
                              content="All data will be permanently deleted"
                              trigger={<Button basic icon="trash" />}
                              onConfirm={async () => {
                                await request({
                                  method: 'DELETE',
                                  path: `/1/users/${item.id}`
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
            </Container>
          );
        }}
      </SearchProvider>
    );
  }
}

