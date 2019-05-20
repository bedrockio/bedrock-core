import React from 'react';

import { Native, styles } from 'app';

export default (props) => (
  <Native.ActivityIndicator
    {...props}
    size={props.size || 'large'}
    style={props.style || styles.center}
  />
);
