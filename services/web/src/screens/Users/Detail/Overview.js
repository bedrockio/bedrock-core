import React from 'react';
import { Header, Table, Loader } from 'semantic';

import screen from 'helpers/screen';

import { formatDateTime } from 'utils/date';

import Menu from './Menu';
import DetailsContext from './Context';

@screen
export default class UserOverview extends React.Component {
  static contextType = DetailsContext;
  render() {
    const { item } = this.context;
    return (
      <React.Fragment>
        <Menu {...this.props} />
        {!item ? (
          <Loader active>Loading</Loader>
        ) : (
          <React.Fragment>
            <Header as="h1">{item.name}</Header>
            <Header as="h3">Details</Header>
            <Table definition>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>Email</Table.Cell>
                  <Table.Cell>{item.email}</Table.Cell>
                </Table.Row>
                {item.phoneNumber && (
                  <Table.Row>
                    <Table.Cell>Phone Number</Table.Cell>
                    <Table.Cell>{item.phoneNumber}</Table.Cell>
                  </Table.Row>
                )}
                <Table.Row>
                  <Table.Cell>Roles</Table.Cell>
                  <Table.Cell>
                    {item.roles.map((r) => r.roleDefinition.name).join(', ')}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Created At</Table.Cell>
                  <Table.Cell>{formatDateTime(item.createdAt)}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Updated At</Table.Cell>
                  <Table.Cell>{formatDateTime(item.updatedAt)}</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}
