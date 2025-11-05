import { NativeSelect as MantineSelect } from '@mantine/core';

// This wrapper is needed as Mantine doesn't provide
// a placeholder in the form of a disabled select option.

export default function NativeSelect(props) {
  const { placeholder, options, ...rest } = props;

  function getOptions() {
    return [
      {
        label: getPlaceholder(),
        disabled: true,
        value: '',
      },
      ...options,
    ];
  }

  function getPlaceholder() {
    if (placeholder) {
      return placeholder;
    } else if (props.label) {
      return `Select ${props.label}`;
    } else {
      return 'Select';
    }
  }

  return <MantineSelect {...rest} data={getOptions()} />;
}
