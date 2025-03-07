import React from 'react';
import { Table, Divider } from 'semantic';

import { usePage } from 'stores/page';

import { formatDateTime } from 'utils/date';
import Meta from 'components/Meta';
import Menu from './Menu';

export default function ApplicationOverview() {
  const { application } = usePage();
  return (
    <React.Fragment>
      <Meta title={application.name} />
      <Menu />
      <Divider hidden />
      <Table definition>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Name</Table.Cell>
            <Table.Cell>{application.name || 'None'}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Description</Table.Cell>
            <Table.Cell>{application.description || 'None'}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>API Key</Table.Cell>
            <Table.Cell>
              <code>{application.apiKey || 'None'}</code>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Request Count</Table.Cell>
            <Table.Cell>
              <code>{application.requestCount}</code>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Created At</Table.Cell>
            <Table.Cell>{formatDateTime(application.createdAt)}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Updated At</Table.Cell>
            <Table.Cell>{formatDateTime(application.updatedAt)}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </React.Fragment>
  );
}
