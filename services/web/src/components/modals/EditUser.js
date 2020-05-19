import React from 'react';
import { Form } from 'semantic-ui-react';

import inject from 'stores/inject';
import EditModal from './EditModal';

const rolesOptions = [
  { text: 'Admin', value: 'admin' },
  { text: 'User', value: 'user' },
];

@inject('users')
export default class EditUser extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
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
    const { user } = this.state;
    if (this.isUpdate()) {
      await this.context.users.update(user);
    } else {
      await this.context.users.create(user);
    }
  };

  render() {
    const { trigger, onSave } = this.props;
    const { user } = this.state;
    return (
      <EditModal
        onSave={onSave}
        trigger={trigger}
        header={this.isUpdate() ? `Edit "${user.name}"` : 'New User'}
        submitText={this.isUpdate() ? 'Update' : 'Create'}
        onSubmit={this.onSubmit}>
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
      </EditModal>
    );
  }
}
