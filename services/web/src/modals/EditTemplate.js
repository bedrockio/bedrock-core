import React from 'react';
import { Form, Modal, Button } from 'semantic';

import modal from 'helpers/modal';

import AutoFocus from 'components/AutoFocus';
import ErrorMessage from 'components/ErrorMessage';

import { request } from 'utils/api';

class EditTemplate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      loading: false,
      template: props.template || {},
    };
  }

  isUpdate() {
    return !!this.props.template;
  }

  setField = (evt, { name, value }) => {
    this.setState({
      template: {
        ...this.state.template,
        [name]: value,
      },
    });
  };

  onSubmit = async () => {
    this.setState({
      error: null,
      loading: true,
    });
    const { template } = this.state;
    try {
      if (this.isUpdate()) {
        await request({
          method: 'PATCH',
          path: `/1/templates/${template.id}`,
          body: template,
        });
      } else {
        await request({
          method: 'POST',
          path: '/1/templates',
          body: template,
        });
      }
      this.props.close();
      this.props.onSave();
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    const { template, loading, error } = this.state;
    return (
      <React.Fragment>
        <Modal.Header>
          {this.isUpdate() ? `Edit "${template.name}"` : 'New Template'}
        </Modal.Header>
        <Modal.Content>
          <AutoFocus>
            <Form
              noValidate
              id="edit-template"
              error={!!error}
              onSubmit={this.onSubmit}>
              <ErrorMessage error={error} />
              <Form.Input
                required
                name="name"
                label="Name"
                value={template.name || ''}
                onChange={this.setField}
              />
              <Form.Dropdown
                selection
                multiple
                name="channels"
                label="Channels"
                value={template.channels || []}
                options={[
                  {
                    text: 'Email',
                    value: 'email',
                  },
                  {
                    text: 'SMS',
                    value: 'sms',
                  },
                  {
                    text: 'Push',
                    value: 'push',
                  },
                ]}
                onChange={this.setField}
              />
            </Form>
          </AutoFocus>
        </Modal.Content>
        <Modal.Actions>
          <Button
            primary
            form="edit-template"
            loading={loading}
            disabled={loading}
            content={this.isUpdate() ? 'Update' : 'Create'}
          />
        </Modal.Actions>
      </React.Fragment>
    );
  }
}

export default modal(EditTemplate);
