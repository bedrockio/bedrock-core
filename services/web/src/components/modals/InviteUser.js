import React from 'react';
import { Form, TextArea, Message } from 'semantic-ui-react';
import inject from 'stores/inject';
import { emailRegexp } from 'utils/validate';

import EditModal from './EditModal';

@inject('invites')
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
    });
  };

  onSubmit = async () => {
    this.setState({
      touched: true,
    });
    try {
      const { validEmails } = this.state;
      await this.context.invites.create({ emails: validEmails });
      this.setState({
        touched: false,
        validEmails: [],
        invalidEmails: [],
      });
    } catch(error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    const { touched, validEmails, invalidEmails } = this.state;
    return (
      <EditModal
        {...this.props}
        header="Invite Users"
        submitText={`Invite Members ${validEmails.length ? `(${validEmails.length})` : ''}`}
        submitDisabled={validEmails.length === 0}
        onSubmit={this.onSubmit}>
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
        {touched && invalidEmails.length > 0 && (
          <Message negative>
            Invalid: {invalidEmails.join(', ')}
          </Message>
        )}
      </EditModal>
    );
  }
}
