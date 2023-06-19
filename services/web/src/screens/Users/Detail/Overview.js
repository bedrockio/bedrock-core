import React from 'react';
import { Header, Table } from 'semantic';

import { withPage } from 'stores/page';
import screen from 'helpers/screen';

import { formatDateTime } from 'utils/date';

import Menu from './Menu';

@screen
@withPage
export default class UserOverview extends React.Component {
  render() {
    const { user } = this.context;
    return (
      <React.Fragment>
        <Menu {...this.props} />
        <Header as="h1">{user.name}</Header>
        <Header as="h3">Details</Header>
        <Table definition>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Email</Table.Cell>
              <Table.Cell>{user.email}</Table.Cell>
            </Table.Row>
            {user.phoneNumber && (
              <Table.Row>
                <Table.Cell>Phone Number</Table.Cell>
                <Table.Cell>{user.phoneNumber}</Table.Cell>
              </Table.Row>
            )}
            <Table.Row>
              <Table.Cell>Roles</Table.Cell>
              <Table.Cell>
                {user.roles.map((r) => r.roleDefinition.name).join(', ')}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Created At</Table.Cell>
              <Table.Cell>{formatDateTime(user.createdAt)}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Updated At</Table.Cell>
              <Table.Cell>{formatDateTime(user.updatedAt)}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </React.Fragment>
    );
  }
}
