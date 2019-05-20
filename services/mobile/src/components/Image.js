import React from 'react';

import { Native, Expo } from 'app';

export default (props) => {
  const { width, height } = Expo.Asset.fromModule(props.source);

  return (
    <Native.Image
      resizeMode="contain"
      {...props}
      style={[
        {
          width: '100%',
          height: undefined,
          aspectRatio: width / height,
          alignSelf: 'center'
        },
        props.style
      ]}
    />
  );
};
