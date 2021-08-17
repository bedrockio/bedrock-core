import React from 'react';
import { Form, Input, Button, Message } from 'semantic';

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
      {error && <Message error content={error.message} />}
      <Form.Field error={error?.hasField?.('code')}>
        <Input
          value={code}
          onChange={(e, { value }) => setCode(value)}
          name="code"
          placeholder="Verification Code"
        />
      </Form.Field>
      <Button
        fluid
        primary
        size="large"
        content="Login"
        loading={loading}
        disabled={loading}
      />
    </Form>
  );
};
