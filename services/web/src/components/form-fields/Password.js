import { TextInput } from '@mantine/core';

export default function PasswordField(props) {
  return (
    <TextInput
      name="password"
      type="password"
      label="Password"
      placeholder="Password"
      autoComplete="new-password"
      {...props}
    />
  );
}
