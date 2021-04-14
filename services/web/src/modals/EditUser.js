import React from 'react';
import { Form, Modal, Message, Button } from 'semantic';
import { request } from 'utils/api';
import AutoFocus from 'components/AutoFocus';
import Roles from 'components/form-fields/Roles';

export default class EditUser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      touched: false,
      loading: false,
      error: null,
      user: props.user || {},
    };
  }

  componentDidUpdate(lastProps) {
    const { user } = this.props;
    if (user && user !== lastProps.user) {
      this.setState({
        user,
      });
    }
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
    try {
      const { user } = this.state;
      this.setState({
        loading: true,
        touched: true,
      });
      if (this.isUpdate()) {
        await request({
          method: 'PATCH',
          path: `/1/users/${user.id}`,
          body: {
            ...user,
            roles: undefined,
          },
        });
      } else {
        await request({
          method: 'POST',
          path: '/1/users',
          body: user,
        });
        this.setState({
          user: {},
          touched: false,
        });
      }
      this.setState({
        open: false,
        loading: false,
      });
      this.props.onSave();
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    const { trigger } = this.props;
    const { user, open, touched, loading, error } = this.state;
    return (
      <Modal
        closeIcon
        closeOnDimmerClick={false}
        onClose={() => this.setState({ open: false })}
        onOpen={() => this.setState({ open: true })}
        open={open}
        trigger={trigger}>
        <Modal.Header>
          {this.isUpdate() ? `Edit "${user.fullName}"` : 'New User'}
        </Modal.Header>
        <Modal.Content>
          <AutoFocus>
            <Form
              id="edit-user"
              onSubmit={this.onSubmit}
              error={touched && !!error}>
              {error && <Message error content={error.message} />}
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
                  required
                  label="Password"
                  value={user.password || ''}
                  onChange={(e, { value }) => this.setField('password', value)}
                />
              )}

              <Roles
                value={user.roles || []}
                onChange={(value) => this.setField('roles', value)}
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
      </Modal>
    );
  }
}
