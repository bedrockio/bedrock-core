import React from 'react';
import { Modal, Form, Button, Message } from 'semantic';

import { request } from 'utils/api';
import AutoFocus from 'components/AutoFocus';
import modal from 'helpers/modal';

@modal
export default class EditApplication extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      loading: false,
      application: props.application || {},
    };
  }

  isUpdate() {
    return !!this.props.application;
  }

  setField = (evt, { name, value }) => {
    this.setState({
      application: {
        ...this.state.application,
        [name]: value,
      },
    });
  };

  setCheckedField = (evt, { name, checked }) => {
    this.setField(evt, { name, value: checked });
  };

  onSubmit = async () => {
    this.setState({
      loading: true,
    });
    const { application } = this.state;

    try {
      if (this.isUpdate()) {
        await request({
          method: 'PATCH',
          path: `/1/applications/${application.id}`,
          body: {
            ...application,
          },
        });
      } else {
        await request({
          method: 'POST',
          path: '/1/applications',
          body: {
            ...application,
          },
        });
      }
      this.props.onSave();
      this.props.close();
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    const { application, loading, error } = this.state;
    return (
      <>
        <Modal.Header>
          {this.isUpdate() ? `Edit "${application.name}"` : 'New Application'}
        </Modal.Header>
        <Modal.Content scrolling>
          <AutoFocus>
            <Form
              noValidate
              id="edit-application"
              error={!!error}
              onSubmit={this.onSubmit}>
              {error && <Message error content={error.message} />}
              <Form.Input
                required
                type="text"
                name="name"
                label="Name"
                value={application.name || ''}
                onChange={this.setField}
              />
              <Form.TextArea
                name="description"
                label="Description"
                value={application.description || ''}
                onChange={this.setField}
              />
            </Form>
          </AutoFocus>
        </Modal.Content>
        <Modal.Actions>
          <Button
            primary
            form="edit-application"
            loading={loading}
            disabled={loading}
            content={this.isUpdate() ? 'Update' : 'Create'}
          />
        </Modal.Actions>
      </>
    );
  }
}
