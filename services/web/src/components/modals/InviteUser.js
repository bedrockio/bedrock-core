import React from 'react';
import { Form, Modal, Button, TextArea, Message } from 'semantic-ui-react';
import { request } from 'utils/api';
import { emailRegexp } from 'utils/validate';
import AutoFocus from 'components/AutoFocus';

export default class InviteUser extends React.Component {

  state = {
    touched: false,
    validEmails: [],
    invalidEmails: [],
  };

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
    try {
      this.setState({
        loading: true,
        touched: true,
        error: null,
      });
      const { validEmails } = this.state;
      await request({
        method: 'POST',
        path: '/1/invites',
        body: {
          emails: validEmails
        }
      });
      this.setState({
        open: false,
        loading: false,
        touched: false,
        validEmails: [],
        invalidEmails: [],
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
    const { validEmails, invalidEmails, open, touched, loading, error } = this.state;
    return (
      <Modal
        closeIcon
        onClose={() => this.setState({ open: false })}
        onOpen={() => this.setState({ open: true })}
        open={open}
        size="tiny"
        trigger={trigger}>
        <Modal.Header>
          Invite Users
        </Modal.Header>
        <Modal.Content>
          <AutoFocus>
            <Form error={touched && !!error}>
              {error && <Message error content={error.message} />}
              {touched && invalidEmails.length > 0 && (
                <Message negative>
                  Invalid: {invalidEmails.join(', ')}
                </Message>
              )}
              <Form.Field>
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
            content={`Invite Members ${validEmails.length ? `(${validEmails.length})` : ''}`}
            onClick={this.onSubmit}
          />
        </Modal.Actions>
      </Modal>
    );
  }
}
