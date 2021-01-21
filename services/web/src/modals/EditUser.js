import React from 'react';
import { Form, Modal, Message, Button } from 'semantic-ui-react';
import { request } from 'utils/api';
import AutoFocus from 'components/AutoFocus';
import Roles from 'components/form-fields/Roles';

function getDefaultState(props) {
  return {
    open: false,
    loading: false,
    error: null,
    user: props.user || {},
  };
}

export default class EditUser extends React.Component {
  state = getDefaultState(this.props);

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
      });
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
      this.onClose();
      this.props.onSave();
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  onClose = () => {
    this.setState(getDefaultState(this.props));
  };

  render() {
    const { trigger } = this.props;
    const { user, open, loading, error } = this.state;
    return (
      <Modal
        closeIcon
        closeOnDimmerClick={false}
        onClose={this.onClose}
        onOpen={() => this.setState({ open: true })}
        open={open}
        trigger={trigger}>
        <Modal.Header>
          {this.isUpdate() ? `Edit "${user.name}"` : 'New User'}
        </Modal.Header>
        <Modal.Content>
          <AutoFocus>
            <Form id="edit-user" onSubmit={this.onSubmit} error={error}>
              {error && <Message error content={error.message} />}
              <Form.Input
                value={user.name || ''}
                label="Name"
                required
                type="text"
                onChange={(e, { value }) => this.setField('name', value)}
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
