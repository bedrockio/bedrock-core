import React from 'react';
import { Form, Modal, Button, TextArea, Message } from 'semantic';
import { request } from 'utils/api';
import { emailRegexp } from 'utils/validate';
import modal from 'helpers/modal';

import AutoFocus from 'components/AutoFocus';
import ErrorMessage from 'components/ErrorMessage';

@modal
export default class InviteUser extends React.Component {
  state = {
    touched: false,
    validEmails: [],
    invalidEmails: [],
    roles: [],
  };

  componentDidMount() {
    this.fetchRoles();
  }

  async fetchRoles() {
    const { data } = await request({
      method: 'GET',
      path: `/1/users/roles`,
    });
    const roles = Object.keys(data).map((key) => {
      return {
        text: data[key].name,
        value: key,
      };
    });
    this.setState({
      role: roles[0].value,
      roles,
    });
  }

  onChange = (e, { value }) => {
    const values = value
      .toLowerCase()
      .split(/[\s,;\t\n]+/)
      .map((str) => str.trim())
      .filter(Boolean);

    const validEmails = [];
    const invalidEmails = [];
    values.forEach((text) => {
      if (text.match(emailRegexp)) {
        validEmails.push(text);
      } else {
        invalidEmails.push(text);
      }
    });
    this.setState({
      validEmails,
      invalidEmails,
      touched: false,
      error: null,
    });
  };

  onSubmit = async () => {
    this.setState({
      loading: true,
      touched: true,
      error: null,
    });

    const { validEmails } = this.state;

    try {
      await request({
        method: 'POST',
        path: '/1/users/invite',
        body: {
          emails: validEmails,
          role: this.state.role,
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
    const { validEmails, invalidEmails, touched, loading, error } = this.state;
    return (
      <>
        <Modal.Header>Invite Users</Modal.Header>
        <Modal.Content>
          <AutoFocus>
            <Form error={touched && !!error}>
              <ErrorMessage error={error} />
              {touched && invalidEmails.length > 0 && (
                <Message negative>Invalid: {invalidEmails.join(', ')}</Message>
              )}

              <Form.Select
                label="Role"
                name="role"
                required
                value={this.state.role}
                onChange={(e, { value }) =>
                  this.setState({
                    role: value,
                  })
                }
                options={this.state.roles}
              />

              <Form.Field required>
                <label>Enter email address of the participant to invite</label>
                <TextArea
                  style={{ height: '150px' }}
                  name="emails"
                  onBlur={() => this.setState({ touched: true })}
                  onChange={this.onChange}
                  placeholder="Email address seperate by comma or newline .e.g first@gmail.com, second@gmail.com"
                />
              </Form.Field>
            </Form>
          </AutoFocus>
        </Modal.Content>
        <Modal.Actions>
          <Button
            primary
            loading={loading}
            disabled={loading || validEmails.length === 0}
            content={`Invite Members ${
              validEmails.length ? `(${validEmails.length})` : ''
            }`}
            onClick={this.onSubmit}
          />
        </Modal.Actions>
      </>
    );
  }
}
