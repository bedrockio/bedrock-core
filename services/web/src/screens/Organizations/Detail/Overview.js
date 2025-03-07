import React from 'react';
import { Table, Divider } from 'semantic';

import { PageContext } from 'stores/page';

import { formatDateTime } from 'utils/date';

import Menu from './Menu';
import Meta from 'components/Meta';

export default class OrganizationOverview extends React.Component {
  static contextType = PageContext;

  render() {
    const { organization } = this.context;
    return (
      <React.Fragment>
        <Meta title={organization.name} />
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
