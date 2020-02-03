import React from 'react';
import { Form, Button, Message } from 'semantic-ui-react';

export default (props) => {
  const { status } = props;
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
          password
        });
      }}
    >
      {status.error && <Message error content={status.error.message} />}
      <Form.Input
        required
        placeholder="Name"
        name="name"
        autoComplete="name"
        icon="id card outline"
        iconPosition="left"
        type="text"
        value={name}
        onChange={(e, { value }) => setName(value)}
      />

      <Form.Input
        required
        placeholder="Password"
        autoComplete="new-password"
        name="password"
        iconPosition="left"
        icon="lock"
        type="password"
        value={password}
        onChange={(e, { value }) => setPassword(value)}
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
        loading={status.request}
        size="large"
        content="Accept Invite"
      />
    </Form>
  );
};
