import React from 'react';
import { Modal, Form } from 'semantic';
import { modal } from 'helpers';
import { Menu } from 'semantic-ui-react';
import { Layout } from 'components';

@modal
export default class OrganizationSelector extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Modal.Header>Select Organization</Modal.Header>
        <Modal.Content>
          <Layout style={{ height: '300px' }}>
            <Form.Input
              id="id"
              icon="search"
              placeholder="Search for organization by name"
              fluid
              style={{ marginBottom: '20px' }}
            />
            <div style={{ height: 'auto', overflowY: 'auto' }}>
              <Menu secondary vertical fluid>
                <Menu.Item as="a" to="#">
                  Bedrock Inc.
                </Menu.Item>
                <Menu.Item as="a" to="#">
                  Bedrock Institute
                </Menu.Item>
                <Menu.Item as="a" to="#">
                  Bedrock Organization
                </Menu.Item>
                <Menu.Item as="a" to="#">
                  Bedrock University
                </Menu.Item>
              </Menu>
            </div>
          </Layout>
        </Modal.Content>
      </React.Fragment>
    );
  }
}
