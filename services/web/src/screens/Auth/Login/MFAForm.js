import React from 'react';
import { Form, Input, Button, Message, Header } from 'semantic';

export default (props) => {
  const { error, loading } = props;
  const [code, setCode] = React.useState('');

  return (
    <Form
      error={!!error}
      size="large"
      onSubmit={() => {
        props.onSubmit({
          code,
        });
      }}>
      <Header>Two-factor authentication</Header>
      {error && <Message error content={error.message} />}

      <Form.Field error={error?.hasField?.('code')}>
        <Input
          value={code}
          onChange={(e, { value }) => setCode(value)}
          name="code"
          placeholder="Enter the security code displayed by your app."
        />
      </Form.Field>
      <Form.Button
        fluid
        primary
        size="large"
        content="Verify Code"
        loading={loading}
        disabled={loading}
      />
    </Form>
  );
};
