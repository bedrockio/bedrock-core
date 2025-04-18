import React from 'react';
import { Modal, Table, Menu, Divider } from 'semantic';
import { Link } from '@bedrockio/router';

import modal from 'helpers/modal';

import Code from 'components/Code';

import { formatDateTime } from 'utils/date';

class ShowAuditEntry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: 'details',
    };
  }

  render() {
    const { auditEntry } = this.props;
    return (
      <>
        <Modal.Header>{auditEntry.activity}</Modal.Header>

        <Modal.Content scrolling>
          <Menu pointing secondary>
            <Menu.Item
              content="Details"
              active={this.state.tab === 'details'}
              onClick={() => this.setState({ tab: 'details' })}
            />
            <Menu.Item
              disabled={!auditEntry.objectAfter && !auditEntry.objectBefore}
              content="Modifications"
              active={this.state.tab === 'modifications'}
              onClick={() => this.setState({ tab: 'modifications' })}
            />
          </Menu>
          <Divider hidden />
          {this.state.tab === 'details' && (
            <>
              <Table definition>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell width={4}>Activity</Table.Cell>
                    <Table.Cell>{auditEntry.activity}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell width={4}>Actor</Table.Cell>
                    <Table.Cell>
                      <Link
                        title={auditEntry.actor.email}
                        to={`/users/${auditEntry.actor.id}`}>
                        {auditEntry.actor.firstName} {auditEntry.actor.lastName}
                      </Link>
                    </Table.Cell>
                  </Table.Row>
                  {auditEntry.objectType && (
                    <Table.Row>
                      <Table.Cell width={4}>Object Type</Table.Cell>
                      <Table.Cell>{auditEntry.objectType}</Table.Cell>
                    </Table.Row>
                  )}
                  {auditEntry.objectId && (
                    <Table.Row>
                      <Table.Cell width={4}>Object Id</Table.Cell>
                      <Table.Cell>{auditEntry.objectId}</Table.Cell>
                    </Table.Row>
                  )}
                  {auditEntry?.owner?.name && (
                    <Table.Row>
                      <Table.Cell width={4}>Object Owner</Table.Cell>
                      <Table.Cell>
                        <Link
                          title={auditEntry.owner.name}
                          to={`/users/${auditEntry.owner.id}`}>
                          {auditEntry.owner.name}
                        </Link>{' '}
                        - {auditEntry.ownerType}
                      </Table.Cell>
                    </Table.Row>
                  )}
                  <Table.Row>
                    <Table.Cell width={4}>Request Method</Table.Cell>
                    <Table.Cell>{auditEntry.requestMethod}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell width={4}>Request Url</Table.Cell>
                    <Table.Cell>{auditEntry.requestUrl}</Table.Cell>
                  </Table.Row>
                  {auditEntry.sessionId && (
                    <Table.Row>
                      <Table.Cell width={4}>Session Id</Table.Cell>
                      <Table.Cell>{auditEntry.sessionId}</Table.Cell>
                    </Table.Row>
                  )}
                  <Table.Row>
                    <Table.Cell width={4}>Created At</Table.Cell>
                    <Table.Cell>
                      {formatDateTime(auditEntry.createdAt)}
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </>
          )}
          {this.state.tab === 'modifications' && (
            <>
              {auditEntry.objectBefore && (
                <>
                  <h3>Before</h3>
                  <Code language="json">
                    {JSON.stringify(auditEntry.objectBefore || {}, null, 2)}
                  </Code>
                </>
              )}
              {auditEntry.objectAfter && (
                <>
                  <h3>After</h3>
                  <Code language="json">
                    {JSON.stringify(auditEntry.objectAfter || {}, null, 2)}
                  </Code>
                </>
              )}
            </>
          )}
        </Modal.Content>
      </>
    );
  }
}
export default modal(ShowAuditEntry);
