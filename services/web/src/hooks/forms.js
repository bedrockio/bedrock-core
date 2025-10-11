import { useState } from 'react';

import { stripEmpty } from 'utils/object';

export function useFields(current) {
  const [fields, setFields] = useState({ ...current });

  function setField(...args) {
    const options = resolveOptions(...args);

    let { type, name, checked, value } = options;

    if (type === 'checkbox') {
      value = checked;
    }

    updateFields({
      [name]: value,
    });
  }

  function updateFields(newFields) {
    setFields((prevFields) => {
      return stripEmpty({
        ...prevFields,
        ...newFields,
      });
    });
  }

  return {
    fields,
    setField,
    setFields,
    updateFields,
  };
}

// The following resolver is to allow setField to be called manually.
// Note that unfortunately Mantine hides nearly all the props in
// onChange events for non-native components (ie those that use combobox).
// Components like Select and MultiSelect will likely require a wrapper.
function resolveOptions(...args) {
  if (args[0]?.nativeEvent) {
    return args[0].target;
  } else if (args.length === 2) {
    return {
      name: args[0],
      value: args[1],
    };
  } else {
    return { ...args[0] };
  }
}
