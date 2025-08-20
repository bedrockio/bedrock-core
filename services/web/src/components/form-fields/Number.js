import { TextInput } from '@mantine/core';

export default function NumberField(props) {
  const { value, min = 0, ...rest } = props;

  function onChange(evt, { value, ...rest }) {
    value = parseInt(value);

    if (isNaN(value)) {
      value = null;
    } else if (value < min) {
      value = min;
    }

    props.onChange(evt, { ...rest, value });
  }

  return (
    <TextInput
      {...rest}
      type="number"
      value={value ?? ''}
      onChange={onChange}
    />
  );
}
