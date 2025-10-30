import { DateTime } from '@bedrockio/chrono';
import { DateInput } from '@mantine/dates';

// This component is required as mantine DateInput
// provides only the value in the onChange event and
// provides the value only as a string.

export default function DateField(props) {
  const { name } = props;

  function onChange(value) {
    const dt = new DateTime(value);
    props.onChange(name, dt);
  }

  return <DateInput {...props} onChange={onChange} />;
}
