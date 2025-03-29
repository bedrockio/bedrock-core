import { useState } from 'react';
import { Form, Button, TextArea, Dropdown, Divider, Message } from 'semantic';

import ErrorMessage from 'components/ErrorMessage';

import { emailRegexp } from 'utils/validate';
import { useRequest } from 'utils/api';

export default function InviteUser({ onSave, close }) {
  const [formState, setFormState] = useState({
    touched: false,
    role: '',
    validEmails: [],
    invalidEmails: [],
  });

  const { touched, role, validEmails, invalidEmails } = formState;

  const { loading, error, makeRequest } = useRequest({
    method: 'POST',
    path: '/1/invites',
  });

  const onInvitesChange = (e, { value }) => {
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
    setFormState({
      ...formState,
      validEmails,
      invalidEmails,
      touched: false,
    });
  };

  const onRoleChange = (e, { value }) => {
    setFormState({
      ...formState,
      role: value,
    });
  };

  const onSubmit = async () => {
    setFormState({
      ...formState,
      touched: true,
    });

    try {
      await makeRequest({
        body: {
          role,
          emails: validEmails,
        },
      });

      onSave();
      close();
    } catch (e) {
      // Error handling is managed by useRequest
    }
  };

  return (
    <>
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
            onBlur={() => setFormState({ ...formState, touched: true })}
            onChange={onInvitesChange}
            placeholder="Email address seperate by comma or newline .e.g first@gmail.com, second@gmail.com"
          />
          <Divider hidden />
          <Dropdown
            selection
            name="role"
            value={role}
            placeholder="Choose Role"
            onChange={onRoleChange}
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

      <Button
        primary
        loading={loading}
        disabled={loading || validEmails.length === 0}
        content={`Invite Members ${
          validEmails.length ? `(${validEmails.length})` : ''
        }`}
        onClick={onSubmit}
      />
    </>
  );
}
