import React from 'react';

import { Components } from 'app';

export default React.forwardRef((props, ref) => (
  <Components.TextInput
    ref={ref}
    keyboardType="email-address"
    autoCorrect={false}
    autoCapitalize="none"
    {...props}
  />
));
