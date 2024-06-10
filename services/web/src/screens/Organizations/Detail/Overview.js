import React from 'react';
import { Table, Divider } from 'semantic';

import { PageContext } from 'stores/page';
import screen from 'helpers/screen';

import { formatDateTime } from 'utils/date';

import Menu from './Menu';

@screen
export default class OrganizationOverview extends React.Component {
  static contextType = PageContext;

  render() {
    const { organization } = this.context;
    return (
      <React.Fragment>
        <Menu />
        <Divider hidden />
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
