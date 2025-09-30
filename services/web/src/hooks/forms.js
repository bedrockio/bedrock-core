import { useState } from 'react';

/**
 * Hook to manage form field state with a simple setter function.
 *
 * @param {Object} current - Object containing initial field values
 * @returns {[Object, setField]} Array with [fields object, setField function]
 *
 * @callback setField
 * @param {Object} options
 * @param {string} options.name - Field name to change.
 * @param {*} options.value - New value for the field.
 */
export function useFields(current) {
  const [fields, setFields] = useState({ ...current });

  function setField(...args) {
    const options = resolveOptions(...args);
    let { type, name, checked, value } = options;
    if (type === 'checkbox') {
      value = checked;
    }
    setFields({
      ...fields,
      [name]: value,
    });
  }

  return [fields, setField];
}

// The following resolver is to allow setField to be called manually.
// Note that unfortunately Mantine hides nearly all the props in
// onChange events for non-native components (ie those that use combobox).
// Components like Select and MultiSelect will likely require a wrapper.
function resolveOptions(...args) {
  if (args[0]?.nativeEvent) {
    return args[0].target;
  } else {
    return { ...args[0] };
  }
}
