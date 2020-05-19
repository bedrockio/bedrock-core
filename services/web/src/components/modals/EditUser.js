import React from 'react';
import { Form, Message, Modal, Button } from 'semantic-ui-react';

import inject from 'stores/inject';
import AutoFocus from 'components/AutoFocus';

const rolesOptions = [
  { text: 'Admin', value: 'admin' },
  { text: 'User', value: 'user' },
];

@inject('users')
export default class EditUser extends React.Component {

  static defaultProps = {
    onSave: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      loading: false,
      touched: false,
      user: props.user || {},
    };
  }

  onChange = (evt, { name, value }) => {
    this.setUserField(name, value);
  }

  onSubmit = async () => {
    const { user } = this.state;

    try {
      this.setState({
        loading: true,
        touched: true,
      });

      if (this.isUpdate()) {
        await this.context.users.update(user);
      } else {
        await this.context.users.create(user);
      }

      this.setState({
        open: false,
        loading: false,
        touched: false,
        user: {},
      });
      this.props.onSave();
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

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

  render() {
    const { trigger } = this.props;
    const { open, touched, error, loading, user } = this.state;
    return (
      <Modal
        closeIcon
        onClose={() =>
          this.setState({
            open: false,
            touched: false,
          })
        }
        onOpen={() => this.setState({ open: true })}
        open={open}
        trigger={trigger}>
        <Modal.Header>{this.isUpdate() ? `Edit "${user.name}"` : 'New User'}</Modal.Header>
        <Modal.Content>
          <AutoFocus>
            <Form error={touched && error}>
              {error && <Message error content={error.message} />}
              <Form.Input
                value={user.name || ''}
                name="name"
                label="Name"
                required
                type="text"
                onChange={this.onChange}
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
                onChange={this.onChange}
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
