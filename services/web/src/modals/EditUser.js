import React from 'react';
import { Form, Modal, Button } from 'semantic';

import modal from 'helpers/modal';

import AutoFocus from 'components/AutoFocus';
import Roles from 'components/form-fields/Roles';
import ErrorMessage from 'components/ErrorMessage';
import PhoneField from 'components/form-fields/Phone';

import { request } from 'utils/api';

class EditUser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      touched: false,
      loading: false,
      error: null,
      user: {
        ...props.user,
      },
    };
  }

  isUpdate() {
    return !!this.props.user;
  }

  setField = (evt, { name, value }) => {
    this.setState({
      user: {
        ...this.state.user,
        [name]: value,
      },
    });
  };

  setCheckedField = (evt, { name, checked }) => {
    this.setField(evt, { name, value: checked });
  };

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

  render() {
    const { user, touched, loading, error } = this.state;
    return (
      <>
        <Modal.Header>
          {this.isUpdate() ? `Edit "${user.name}"` : 'New User'}
        </Modal.Header>
        <Modal.Content>
          <AutoFocus>
            <Form
              id="edit-user"
              onSubmit={this.onSubmit}
              error={touched && !!error}>
              <ErrorMessage error={error} />
              <Form.Input
                required
                value={user.firstName || ''}
                name="firstName"
                label="First Name"
                type="text"
                autoComplete="given-name"
                onChange={this.setField}
              />
              <Form.Input
                required
                name="lastName"
                value={user.lastName || ''}
                label="Last Name"
                type="text"
                autoComplete="family-name"
                onChange={this.setField}
              />
              <Form.Input
                value={user.email || ''}
                type="email"
                name="email"
                label="Email"
                onChange={this.setField}
              />
              <PhoneField
                name="phone"
                value={user.phone || ''}
                onChange={this.setField}
                error={error}
              />
              {!this.isUpdate() && (
                <Form.Input
                  name="password"
                  label="Password"
                  value={user.password || ''}
                  onChange={this.setField}
                />
              )}
              <Roles
                name="roles"
                value={user.roles || []}
                onChange={this.setField}
              />
              <Form.Checkbox
                checked={user.isTester || false}
                name="isTester"
                label="Is Tester"
                onChange={this.setCheckedField}
              />
            </Form>
          </AutoFocus>
        </Modal.Content>
        <Modal.Actions>
          <Button
            primary
            form="edit-user"
            loading={loading}
            disabled={loading}
            content={this.isUpdate() ? 'Update' : 'Create'}
          />
        </Modal.Actions>
      </>
    );
  }
}

export default modal(EditUser);
