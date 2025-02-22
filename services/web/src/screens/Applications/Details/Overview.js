import React from 'react';
import { Table, Divider } from 'semantic';

import screen from 'helpers/screen';
import { usePage } from 'contexts/page';

import { formatDateTime } from 'utils/date';

import Menu from './Menu';

function ApplicationOverview() {
  const { application } = usePage();
  return (
    <React.Fragment>
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

export default screen(ApplicationOverview);
