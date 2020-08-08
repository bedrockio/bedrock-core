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
      item: props.item || {},
    };
  }

  isUpdate() {
    return !!this.props.item;
  }

  setField(name, value) {
    this.setState({
      item: {
        ...this.state.item,
        [name]: value,
      },
    });
  }

  onSubmit = async () => {
    try {
      const { item } = this.state;
      this.setState({
        loading: true,
        touched: true,
      });
      if (this.isUpdate()) {
        await request({
          method: 'PATCH',
          path: `/1/users/${item.id}`,
          body: item,
        });
      } else {
        await request({
          method: 'POST',
          path: '/1/users',
          body: item,
        });
        this.setState({
          item: {},
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
    const { item, open, touched, loading, error } = this.state;
    return (
      <Modal
        closeIcon
        closeOnDimmerClick={false}
        onClose={() => this.setState({ open: false })}
        onOpen={() => this.setState({ open: true })}
        open={open}
        trigger={trigger}>
        <Modal.Header>{this.isUpdate() ? `Edit "${item.name}"` : 'New User'}</Modal.Header>
        <Modal.Content>
          <AutoFocus>
            <Form error={touched && error}>
              {error && <Message error content={error.message} />}
              <Form.Input
                value={item.name || ''}
                label="Name"
                required
                type="text"
                onChange={(e, { value }) => this.setField('name', value)}
              />
              <Form.Input
                value={item.email || ''}
                required
                type="email"
                label="Email"
                onChange={(e, { value }) => this.setField('email', value)}
              />
              {!this.isUpdate() && (
                <Form.Input
                  required
                  label="Password"
                  value={item.password || ''}
                  onChange={(e, { value }) => this.setField('password', value)}
                />
              )}
              <Form.Dropdown
                name="roles"
                label="Roles"
                required
                fluid
                selection
                multiple
                value={item.roles || []}
                options={rolesOptions}
                onChange={(e, { value }) => this.setField('roles', value)}
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
