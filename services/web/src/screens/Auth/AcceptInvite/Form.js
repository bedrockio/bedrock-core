import React from 'react';
import { Form, Button } from 'semantic';

import ErrorMessage from 'components/ErrorMessage';

export default (props) => {
  const { error, loading } = props;
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [touched, setTouched] = React.useState(false);
  const [accepted, setAccepted] = React.useState(false);
  return (
    <Form
      error={touched}
      size="large"
      onSubmit={() => {
        setTouched(true);
        if (!accepted) return;

        props.onSubmit({
          firstName,
          lastName,
          password,
        });
      }}>
      <ErrorMessage error={error} />
      <Form.Input
        type="text"
        name="firstName"
        value={firstName}
        placeholder="First Name"
        autoComplete="given-name"
        onChange={(e, { value }) => setFirstName(value)}
        error={error?.hasField?.('firstName')}
      />
      <Form.Input
        type="text"
        name="lastName"
        value={lastName}
        placeholder="Last Name"
        autoComplete="family-name"
        onChange={(e, { value }) => setLastName(value)}
        error={error?.hasField?.('lastName')}
      />
      <Form.Input
        placeholder="Password"
        autoComplete="new-password"
        name="password"
        iconPosition="left"
        icon="lock"
        type="password"
        value={password}
        onChange={(e, { value }) => setPassword(value)}
        error={error?.hasField?.('password')}
      />
      <Form.Checkbox
        error={touched && !accepted}
        name="acceptTerms"
        checked={accepted}
        label={
          <label>
            I agree to the{' '}
            <a target="_blank" href="/terms">
              Terms of Service
            </a>
          </label>
        }
        onChange={(e, { checked }) => setAccepted(checked)}
      />
      <Button
        fluid
        primary
        loading={loading}
        disabled={loading}
        size="large"
        content="Accept Invite"
      />
    </Form>
  );
};
