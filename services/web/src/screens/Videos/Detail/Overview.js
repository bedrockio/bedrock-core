import React from 'react';
import { Table, Header, Divider } from 'semantic';
import { screen } from 'helpers';
import Menu from './Menu';

import { formatDateTime } from 'utils/date';

@screen
export default class VideoOverview extends React.Component {
  render() {
    const { video } = this.props;
    return (
      <React.Fragment>
        <Menu {...this.props} />
        <Divider hidden />

        <Table definition>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Upload</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Created At</Table.Cell>
              <Table.Cell>{formatDateTime(video.createdAt)}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Updated At</Table.Cell>
              <Table.Cell>{formatDateTime(video.updatedAt)}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </React.Fragment>
    );
  }
}
