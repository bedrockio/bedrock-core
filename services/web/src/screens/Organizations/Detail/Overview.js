import React from 'react';
import { Header, Table, Divider } from 'semantic';

import screen from 'helpers/screen';

import { formatDateTime } from 'utils/date';

import Menu from './Menu';
import DetailsContext from './Context';

@screen
export default class OrganizationOverview extends React.Component {
  static contextType = DetailsContext;

  render() {
    const { item } = this.context;
    return (
      <React.Fragment>
        <Menu />
        <Divider hidden />
        <Header as="h1">{item.name}</Header>
        <Header as="h3">Details</Header>
        <Table definition>
          <Table.Body>
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
    );
  }
}
