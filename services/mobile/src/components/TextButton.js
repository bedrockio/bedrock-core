import React from 'react';

import { Native, helpers, constants, styles } from 'app';

export default ({ title, onPress, url }) => (
  <Native.TouchableOpacity
    onPress={onPress || helpers.linkTo(url)}
    style={[styles.centerChildren, { padding: constants.spacing.large / 2 }]}
  >
    <Native.Text
      style={[styles.interfaceText, { color: constants.colors.indigo }]}
    >
      {title}
    </Native.Text>
  </Native.TouchableOpacity>
);
