import React from 'react';
import { Form, Modal, Message, Button } from 'semantic';
import { request } from 'utils/api';
import { modal } from 'helpers';

@modal
export default class SetupSms extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      touched: false,
      loading: false,
      error: null,
      phone: props.user.phoneNumber || {},
    };
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
      await request({
        method: 'PATCH',
        path: `/1/users/${user.id}`,
        body: {
          ...user,
          roles: undefined,
        },
      });

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
        <Modal.Header>Set up SMS authentication</Modal.Header>
        <Modal.Content>
          <p>
            We will send authentication codes to your mobile phone during sign
            in.
          </p>

          <Form onSubmit={this.onSubmit} error={touched && !!error}>
            {error && <Message error content={error.message} />}
            <Form.Select
              options={[]}
              value={user.firstName || ''}
              label="Country code"
              required
              type="text"
              autoComplete="given-name"
              onChange={(e, { value }) => this.setField('firstName', value)}
            />
            <Form.Input
              value={user.firstName || ''}
              label="Phone number"
              required
              type="text"
              autoComplete="given-name"
              onChange={(e, { value }) => this.setField('firstName', value)}
            />
            Authentication codes will be sent here.
            <Button>Send authentication Code</Button>
          </Form>

          <Form onSubmit={this.onSubmit} error={touched && !!error}>
            {error && <Message error content={error.message} />}
            Enter the six-digit code sent to your phone
            <Form.Input
              value={user.firstName || ''}
              label="Phone number"
              required
              type="text"
              autoComplete="given-name"
              onChange={(e, { value }) => this.setField('firstName', value)}
            />
            It may take a minute to arrive.
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button
            primary
            loading={loading}
            disabled={loading}
            content={'Enable'}
          />
        </Modal.Actions>
      </>
    );
  }
}
