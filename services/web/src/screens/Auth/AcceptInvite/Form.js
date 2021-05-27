import React from 'react';
import { Form, Button, Message } from 'semantic';

export default (props) => {
  const { error, loading } = props;
  const [name, setName] = React.useState('');
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
          name,
          password,
        });
      }}>
      {error && <Message error content={error.message} />}
      <Form.Input
        placeholder="Name"
        name="name"
        autoComplete="name"
        icon="id-card outline"
        iconPosition="left"
        type="text"
        value={name}
        onChange={(e, { value }) => setName(value)}
        error={error?.hasField?.('name')}
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
