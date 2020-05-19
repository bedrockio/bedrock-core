import React from 'react';
import { formatDateTime } from 'utils/date';
import { request } from 'utils/api';

import { Confirm } from 'components/Semantic';
import AppWrapper from 'components/AppWrapper';
import HelpTip from 'components/HelpTip';
import EditUser from 'components/modals/EditUser';
import Filters from 'components/modals/Filters';
import { SearchProvider } from 'components/data';

import {
  Container,
  Header,
  Table,
  Message,
  Button,
} from 'semantic-ui-react';

export default class Users extends React.Component {

  onDataNeeded = async (params) => {
    return await request({
      method: 'POST',
      path: '/1/users/search',
      body: params,
    });
  };

  render() {
    return (
      <AppWrapper>
        <SearchProvider onDataNeeded={this.onDataNeeded}>
          {({ items, getSorted, setSort, filters, setFilters, reload }) => {
            return (
              <Container>
                <div style={{float: 'right', marginTop: '-5px'}}>
                  <Filters
                    onSave={setFilters}
                    filters={filters}
                    fields={[
                      {
                        text: 'Role',
                        name: 'role',
                        options: [
                          {
                            text: 'User',
                            value: 'user',
                          },
                          {
                            text: 'Admin',
                            value: 'admin',
                          }
                        ]
                      }
                    ]}
                  />
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
                </div>
                <Header as="h2">
                  Users
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
                            <Table.Cell>{item.name}</Table.Cell>
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
      </AppWrapper>
    );
  }
}
