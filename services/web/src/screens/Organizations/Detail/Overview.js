import React from 'react';
import { Header, Table, Divider } from 'semantic';

import screen from 'helpers/screen';
import { withPage } from 'stores/page';

import { formatDateTime } from 'utils/date';

import Menu from './Menu';

@screen
@withPage
export default class OrganizationOverview extends React.Component {
  render() {
    const { organization } = this.context;
    return (
      <React.Fragment>
        <Menu />
        <Divider hidden />
        <Header as="h1">{organization.name}</Header>
        <Header as="h3">Details</Header>
        <Table definition>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Created At</Table.Cell>
              <Table.Cell>{formatDateTime(organization.createdAt)}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Updated At</Table.Cell>
              <Table.Cell>{formatDateTime(organization.updatedAt)}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </React.Fragment>
    );
  }
}
