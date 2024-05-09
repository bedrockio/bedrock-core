import React from 'react';
import {
  Form,
  Modal,
  Button,
  TextArea,
  Dropdown,
  Divider,
  Message,
} from 'semantic';

import modal from 'helpers/modal';

import AutoFocus from 'components/AutoFocus';
import ErrorMessage from 'components/ErrorMessage';

import { emailRegexp } from 'utils/validate';
import { request } from 'utils/api';

@modal
export default class InviteUser extends React.Component {
  state = {
    touched: false,
    role: '',
    validEmails: [],
    invalidEmails: [],
  };

  onInvitesChange = (e, { value }) => {
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

  onRoleChange = (e, { value }) => {
    this.setState({
      role: value,
    });
  };

  onSubmit = async () => {
    this.setState({
      loading: true,
      touched: true,
      error: null,
    });

    const { role, validEmails } = this.state;

    try {
      await request({
        method: 'POST',
        path: '/1/invites',
        body: {
          role,
          emails: validEmails,
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
    const { validEmails, invalidEmails, role, touched, loading, error } =
      this.state;
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
              <Form.Field>
                <label>Enter email address of the participant to invite</label>
                <TextArea
                  style={{ height: '150px' }}
                  name="emails"
                  onBlur={() => this.setState({ touched: true })}
                  onChange={this.onInvitesChange}
                  placeholder="Email address seperate by comma or newline .e.g first@gmail.com, second@gmail.com"
                />
                <Divider hidden />
                <Dropdown
                  selection
                  name="role"
                  value={role}
                  placeholder="Choose Role"
                  onChange={this.onRoleChange}
                  options={[
                    {
                      text: 'Viewer',
                      value: 'viewer',
                    },
                    {
                      text: 'Admin',
                      value: 'admin',
                    },
                    {
                      text: 'Super Admin',
                      value: 'superAdmin',
                    },
                  ]}
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
