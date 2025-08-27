import { TextInput } from "@mantine/core";

export default function EmailField(props) {
  return (
    <TextInput
      name="email"
      type="email"
      label="Email"
      placeholder="Email"
      autoComplete="email"
      {...props}
    />
  );
}
