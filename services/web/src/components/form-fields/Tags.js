import { TagsInput } from '@mantine/core';

// Mantine onChange props 👎

export default function TagsField(props) {
  function onChange(value) {
    props.onChange({ ...props, value });
  }

  return <TagsInput {...props} onChange={onChange} />;
}
