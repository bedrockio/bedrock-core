import React from 'react';
import { Form, Input, Button, Message, Header } from 'semantic';

export default ({ error, loading, mfaMethod, mfaPhoneNumber, onSubmit }) => {
  const [code, setCode] = React.useState('');

  function sendCode() {}

  React.useEffect(() => {
    sendCode();
  }, []);

  return (
    <Form
      error={!!error}
      size="large"
      onSubmit={() => {
        onSubmit({
          code,
        });
      }}>
      <Header>Two-factor Verification</Header>
      {error && <Message error content={error.message} />}
      {mfaMethod === 'otp' && (
        <Form.Field error={error?.hasField?.('code')}>
          <Input
            value={code}
            onChange={(e, { value }) => setCode(value)}
            name="code"
            placeholder="Enter the security code displayed by your app."
          />
        </Form.Field>
      )}
      {mfaMethod === 'sms' && (
        <>
          <p>
            For added security, please enter the One Time Password (OTP) that
            has been sent to a phone number ending in {mfaPhoneNumber}
          </p>
          <Form.Field error={error?.hasField?.('code')}>
            <Input
              value={code}
              onChange={(e, { value }) => setCode(value)}
              name="code"
              placeholder="Enter the six-digit code sent to your phone"
            />
          </Form.Field>
          <p>It may take a minute to arrive.</p>
        </>
      )}
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
