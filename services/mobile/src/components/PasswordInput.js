import React from 'react';

import { Components } from 'app';

export default React.forwardRef((props, ref) => (
  <Components.TextInput
    ref={ref}
    placeholder="Password"
    secureTextEntry
    {...props}
  />
));
