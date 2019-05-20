import React from 'react';

import { Components } from 'app';

export default (props) => {
  if (props.loading)
    return (
      <Components.ActivityIndicator
        size={props.activityIndicatorSize}
        style={props.activityIndicatorStyle}
      />
    );
  else return props.children;
};
