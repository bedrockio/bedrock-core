import React from 'react';

import { Native, Components, constants, styles } from 'app';

export default ({ selected, disabled, invalid, content, onPress }) => (
  <Native.TouchableOpacity
    disabled={disabled}
    onPress={onPress}
    style={[
      styles.flex,
      {
        padding: constants.spacing.small,
        borderColor: constants.colors.transparent,
        borderWidth: 1,
        borderRadius: 5
      },
      invalid && styles.inputWithError,
      {
        backgroundColor: selected ? constants.colors.indigo : null
      }
    ]}
  >
    <Components.Image source={content} style={{ borderColor: 'green' }} />
  </Native.TouchableOpacity>
);
