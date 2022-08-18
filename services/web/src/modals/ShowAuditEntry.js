import React from 'react';
import { Modal, Table, Menu, Divider } from 'semantic';
import modal from 'helpers/modal';

import CodeBlock from 'components/Markdown/Code';

import { Link } from 'react-router-dom';
import { formatDateTime } from 'utils/date';

@modal
export default class ShowAuditEntry extends React.Component {
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
              disabled={!auditEntry.objectAfter || !auditEntry.objectBefore}
              content="Modifitions"
              active={this.state.tab === 'modifitions'}
              onClick={() => this.setState({ tab: 'modifitions' })}
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
                    <Table.Cell width={4}>User</Table.Cell>
                    <Table.Cell>
                      <Link
                        title={auditEntry.user.email}
                        to={`/users/${auditEntry.user.id}`}>
                        {auditEntry.user.firstName} {auditEntry.user.firstName}
                      </Link>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell width={4}>Request Method</Table.Cell>
                    <Table.Cell>{auditEntry.requestMethod}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell width={4}>Request Url</Table.Cell>
                    <Table.Cell>{auditEntry.requestUrl}</Table.Cell>
                  </Table.Row>
                  {auditEntry.objectType && (
                    <Table.Row>
                      <Table.Cell width={4}>Object Type</Table.Cell>
                      <Table.Cell>{auditEntry.objectType}</Table.Cell>
                    </Table.Row>
                  )}
                  {auditEntry.objectId && (
                    <Table.Row>
                      <Table.Cell width={4}>ObjectId</Table.Cell>
                      <Table.Cell>{auditEntry.objectId}</Table.Cell>
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
          {this.state.tab === 'modifitions' && (
            <>
              <h3>Before</h3>
              <CodeBlock
                source={JSON.stringify(auditEntry.objectBefore || {}, null, 2)}
                language="json"
                allowCopy
              />
              <h3>After</h3>
              <CodeBlock
                source={JSON.stringify(auditEntry.objectAfter || {}, null, 2)}
                language="json"
                allowCopy
              />
            </>
          )}
        </Modal.Content>
      </>
    );
  }
}
