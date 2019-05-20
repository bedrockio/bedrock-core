import React from 'react';
import { observer, inject } from 'mobx-react';
import { Form, Message, Modal, Button } from 'semantic-ui-react';
import Password from 'components/form-fields/Password';

const rolesOptions = [
  { text: 'Admin', value: 'admin' },
  { text: 'User', value: 'user' }
];

@inject('users')
@observer
export default class EditUser extends React.Component {
  static defaultProps = {
    initialValues: {}
  };

  state = {
    open: false,
    formValues: { ...this.props.initialValues }
  };

  componentDidUpdate(prevProps) {
    if (this.props.initialValues !== prevProps.initialValues) {
      this.setState({
        touched: false,
        formValues: { ...this.props.initialValues }
      });
    }
  }

  handleSubmit = () => {
    const { users, initialValues } = this.props;
    this.setState({
      touched: true
    });

    const action = initialValues.id
      ? users.update.bind(users)
      : users.create.bind(users);

    return action(this.state.formValues).then((err) => {
      if (err instanceof Error) return;
      this.setState({
        formValues: this.props.initialValues,
        open: false,
        touched: false
      });
    });
  };

  setField(name, value) {
    this.setState({
      formValues: {
        ...this.state.formValues,
        [name]: value
      }
    });
  }

  render() {
    const { users, initialValues, trigger } = this.props;
    const { formValues = {}, touched, open } = this.state;

    const isUpdate = !!initialValues.id;
    const status = isUpdate
      ? users.getStatus('update')
      : users.getStatus('create');

    return (
      <Modal
        closeIcon
        onClose={() =>
          this.setState({
            open: false,
            formValues: this.props.initialValues,
            touched: false
          })
        }
        onOpen={() => this.setState({ open: true })}
        open={open}
        trigger={trigger}
      >
        <Modal.Header>
          {isUpdate ? `Edit "${initialValues.name}"` : 'New User'}
        </Modal.Header>
        <Modal.Content>
          <Form
            error={touched && Boolean(status.error)}
            onSubmit={() => this.handleSubmit()}
          >
            {status.error && <Message error content={status.error.message} />}
            <Form.Input
              value={formValues.email || ''}
              required
              name="email"
              label="E-mail"
              type="text"
              onChange={(e, { name, value }) => this.setField(name, value)}
            />
            <Form.Input
              value={formValues.name || ''}
              name="name"
              label="Name"
              required
              type="text"
              onChange={(e, { name, value }) => this.setField(name, value)}
            />
            {!isUpdate && (
              <Password
                name="password"
                label="Password"
                required
                value={formValues.password || ''}
                onChange={(e, { name, value }) => this.setField(name, value)}
              />
            )}
            <Form.Dropdown
              name="roles"
              label="Roles"
              required
              fluid
              selection
              multiple
              value={formValues.roles || []}
              options={rolesOptions}
              onChange={(e, { name, value }) => this.setField(name, value)}
            />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button
            loading={status.request === true}
            primary
            content={isUpdate ? 'Update' : 'Create'}
            onClick={this.handleSubmit}
          />
        </Modal.Actions>
      </Modal>
    );
  }
}
