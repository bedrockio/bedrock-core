import React from 'react';
import { Header, Table, Image, Label, Divider } from 'semantic';
import { screen } from 'helpers';
import Menu from './Menu';

import { formatDateTime } from 'utils/date';

@screen
export default class OrganizationOverview extends React.Component {
  render() {
    const { organization } = this.props;
    return (
      <React.Fragment>
        <Menu {...this.props} />
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
