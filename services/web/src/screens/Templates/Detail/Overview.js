import React from 'react';
import { Table, Divider, Label } from 'semantic';

import { PageContext } from 'stores/page';

import { formatDateTime } from 'utils/date';

import Menu from './Menu';

export default class TemplateOverview extends React.Component {
  static contextType = PageContext;

  render() {
    const { template } = this.context;
    return (
      <React.Fragment>
        <Menu />
        <Divider hidden />
        <Table definition>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Channels</Table.Cell>
              <Table.Cell>
                {template.channels.map((channel) => {
                  return <Label key={channel}>{channel}</Label>;
                })}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Created At</Table.Cell>
              <Table.Cell>{formatDateTime(template.createdAt)}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Updated At</Table.Cell>
              <Table.Cell>{formatDateTime(template.updatedAt)}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </React.Fragment>
    );
  }
}
