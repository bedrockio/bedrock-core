import React from 'react';
import { Modal, Form, Button, Message } from 'semantic';
import { request } from 'utils/api';
import AutoFocus from 'components/AutoFocus';
import modal from 'helpers/modal';

@modal
export default class EditOrganization extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      loading: false,
      organization: props.organization || {},
    };
  }

  isUpdate() {
    return !!this.props.organization;
  }

  setField = (evt, { name, value }) => {
    this.setState({
      organization: {
        ...this.state.organization,
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
    const { organization } = this.state;

    try {
      if (this.isUpdate()) {
        await request({
          method: 'PATCH',
          path: `/1/organizations/${organization.id}`,
          body: {
            ...organization,
          },
        });
      } else {
        await request({
          method: 'POST',
          path: '/1/organizations',
          body: {
            ...organization,
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
    const { organization, loading, error } = this.state;
    return (
      <>
        <Modal.Header>
          {this.isUpdate() ? `Edit "${organization.name}"` : 'New Organization'}
        </Modal.Header>
        <Modal.Content scrolling>
          <AutoFocus>
            <Form
              noValidate
              id="edit-organization"
              error={!!error}
              onSubmit={this.onSubmit}>
              {error && <Message error content={error.message} />}
              <Form.Input
                required
                type="text"
                name="name"
                label="Name"
                value={organization.name || ''}
                onChange={this.setField}
              />
            </Form>
          </AutoFocus>
        </Modal.Content>
        <Modal.Actions>
          <Button
            primary
            form="edit-organization"
            loading={loading}
            disabled={loading}
            content={this.isUpdate() ? 'Update' : 'Create'}
          />
        </Modal.Actions>
      </>
    );
  }
}
