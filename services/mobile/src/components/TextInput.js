import React from 'react';

import { Native, constants, styles } from 'app';

export default React.forwardRef((props, ref) => (
  <Native.TextInput
    ref={ref}
    enablesReturnKeyAutomatically
    blurOnSubmit={false}
    placeholderTextColor={constants.colors.gray}
    {...props}
    style={[
      styles.interfaceTextWithCenteringAdjustment,
      styles.borderedInput,
      {
        height: 60,
        marginBottom: constants.spacing.base,
        paddingHorizontal: constants.spacing.large
      },
      props.style,
      props.invalid && styles.inputWithError
    ]}
  />
));
