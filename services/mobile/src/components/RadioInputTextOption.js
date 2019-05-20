import React from 'react';

import { Components, constants } from 'app';

export default ({ selected, disabled, invalid, content, onPress, style }) => (
  <Components.Checkbox
    title={content}
    value={selected}
    disabled={disabled}
    invalid={invalid}
    onValueChange={onPress}
  />
);
