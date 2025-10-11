import { NumberInput } from '@mantine/core';

export default function NumberField(props) {
  const { value, ...rest } = props;

  function onChange(value) {
    props.onChange({ ...rest, value });
  }

  return <NumberInput {...rest} value={value ?? ''} onChange={onChange} />;
}
