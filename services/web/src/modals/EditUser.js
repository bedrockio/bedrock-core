import React from 'react';
import { Form, Modal, Button, Message } from 'semantic';
import { request } from 'utils/api';
import modal from 'helpers/modal';

import Roles from 'components/form-fields/Roles';
import ErrorMessage from 'components/ErrorMessage';
import AutoFocus from 'components/AutoFocus';

@modal
export default class EditUser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: null,
      user: props.user || {},
    };
  }

  isUpdate() {
    return !!this.props.user;
  }

  setField(name, value) {
    this.setState({
      user: {
        ...this.state.user,
        [name]: value,
      },
    });
  }

  onSubmit = async () => {
    const { user } = this.state;
    this.setState({
      loading: true,
      touched: true,
    });

    try {
      if (this.isUpdate()) {
        await request({
          method: 'PATCH',
          path: `/1/users/${user.id}`,
          body: user,
        });
      } else {
        await request({
          method: 'POST',
          path: '/1/users',
          body: user,
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

  getButtonLabel() {
    if (!this.isUpdate() && !this.state.user.password) {
      return 'Invite';
    }
    return this.isUpdate() ? 'Update' : 'Create';
  }

  render() {
    const { user, loading, error } = this.state;

    return (
      <>
        <Modal.Header>
          {this.isUpdate() ? `Edit "${user.name || user.email}"` : 'New User'}
        </Modal.Header>
        <Modal.Content>
          <Form id="edit-user" onSubmit={this.onSubmit}>
            <AutoFocus>
              <ErrorMessage error={error} />
              <Form.Input
                value={user.firstName || ''}
                label="First Name"
                required
                type="text"
                autoComplete="given-name"
                onChange={(e, { value }) => this.setField('firstName', value)}
              />
              <Form.Input
                value={user.lastName || ''}
                label="Last Name"
                required
                type="text"
                autoComplete="family-name"
                onChange={(e, { value }) => this.setField('lastName', value)}
              />
              <Form.Input
                value={user.email || ''}
                required
                type="email"
                label="Email"
                onChange={(e, { value }) => this.setField('email', value)}
              />
              {!this.isUpdate() && (
                <Form.Input
                  label="Password"
                  value={user.password || ''}
                  onChange={(e, { value }) => this.setField('password', value)}
                />
              )}
              {!this.isUpdate() && !this.state.password && (
                <Message content="Not setting a password, will trigger an invitation to the user" />
              )}
              <Roles
                value={user.roles || []}
                onChange={(e, { value }) => this.setField('roles', value)}
              />
            </AutoFocus>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button
            primary
            form="edit-user"
            loading={loading}
            disabled={loading}
            content={this.getButtonLabel()}
          />
        </Modal.Actions>
      </>
    );
  }
}
