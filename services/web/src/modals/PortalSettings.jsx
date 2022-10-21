import React from 'react';
import { Modal, Form } from '/semantic';

import { request } from '/utils/api';

import SearchDropdown from '/components/SearchDropdown';
import modal from '/helpers/modal';
import { Context } from '../screens/Docs/Context';

class PortalSettings extends React.Component {
  static contextType = Context;

  fetchApplications = async (keyword) => {
    const { data } = await request({
      method: 'POST',
      path: '/1/applications/mine/search',
      body: {
        keyword,
      },
    });
    return data;
  };

  onChange = (evt, { value }) => {
    this.context.setApplication(value);
    this.props.close();
  };

  render() {
    return (
      <React.Fragment>
        <Modal.Header>Settings</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <label>Change Application</label>
              <SearchDropdown
                fluid
                clearable
                placeholder="Viewing all applications"
                value={this.context?.application}
                onDataNeeded={this.fetchApplications}
                onChange={this.onChange}
              />
            </Form.Field>
          </Form>
        </Modal.Content>
      </React.Fragment>
    );
  }
}

export default modal(PortalSettings);
