import React from 'react';
import { Form, Modal, Message, Button } from 'semantic-ui-react';
import { request } from 'utils/api';
import AutoFocus from 'components/AutoFocus';

const rolesOptions = [
  { text: 'Admin', value: 'admin' },
  { text: 'User', value: 'user' },
];

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

  isUpdate() {
    return !!this.props.user;
  }

  setUserField(name, value) {
    this.setState({
      user: {
        ...this.state.user,
        [name]: value,
      }
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
          body: user,
        });
      } else {
        await request({
          method: 'POST',
          path: '/1/users',
          body: user
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
        onClose={() => this.setState({ open: false })}
        onOpen={() => this.setState({ open: true })}
        open={open}
        trigger={trigger}>
        <Modal.Header>
          {this.isUpdate() ? `Edit "${user.name}"` : 'New User'}
        </Modal.Header>
        <Modal.Content>
          <AutoFocus>
            <Form error={touched && error}>
              {error && <Message error content={error.message} />}
              <Form.Input
                value={user.name || ''}
                label="Name"
                required
                type="text"
                onChange={(e, { value }) => this.setUserField('name', value)}
              />
              <Form.Input
                value={user.email || ''}
                required
                type="email"
                label="Email"
                onChange={(e, { value }) => this.setUserField('email', value)}
              />
              {!this.isUpdate() && (
                <Form.Input
                  required
                  label="Password"
                  value={user.password || ''}
                  onChange={(e, { value }) => this.setUserField('password', value)}
                />
              )}
              <Form.Dropdown
                name="roles"
                label="Roles"
                required
                fluid
                selection
                multiple
                value={user.roles || []}
                options={rolesOptions}
                onChange={(e, { value }) => this.setUserField('roles', value)}
              />
            </Form>
          </AutoFocus>
        </Modal.Content>
        <Modal.Actions>
          <Button
            primary
            loading={loading}
            disabled={loading}
            content={this.isUpdate() ? 'Update' : 'Create'}
            onClick={this.onSubmit}
          />
        </Modal.Actions>
      </Modal>
    );
  }
}
