import React from 'react';
import { Form, Button } from 'semantic';

import ErrorMessage from 'components/ErrorMessage';

export default (props) => {
  const { payload, error, loading } = props;
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [touched, setTouched] = React.useState(false);
  const [accepted, setAccepted] = React.useState(false);

  // Note that the disabled email field here is only to ensure
  // that browsers don't incorrectly save the last name as the
  // username as their heuristics don't seem to take the autocomplete
  // values into account here:
  // https://stackoverflow.com/a/27536519/907125

  return (
    <Form
      error={touched}
      size="large"
      onSubmit={() => {
        setTouched(true);
        if (!accepted) {
          return;
        }

        props.onSubmit({
          firstName,
          lastName,
          password,
        });
      }}>
      <ErrorMessage error={error} />
      <Form.Input
        name="firstName"
        value={firstName}
        placeholder="First Name"
        autoComplete="given-name"
        onChange={(e, { value }) => setFirstName(value)}
        error={error?.hasField?.('firstName')}
      />
      <Form.Input
        name="lastName"
        value={lastName}
        placeholder="Last Name"
        autoComplete="family-name"
        onChange={(e, { value }) => setLastName(value)}
        error={error?.hasField?.('lastName')}
      />
      <Form.Input
        name="email"
        value={payload.sub}
        placeholder="Email"
        autoComplete="username"
        disabled
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
