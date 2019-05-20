import React from 'react';

import { Native, Components, constants, styles } from 'app';

export default ({ title, disabled, onPress, inProgress, style }) => (
  <Native.TouchableHighlight
    disabled={disabled}
    onPress={onPress}
    underlayColor={constants.colors.indigoHighlight}
    style={[
      styles.centerChildren,
      styles.shadow,
      {
        height: 55,
        marginVertical: constants.spacing.base,
        paddingHorizontal: constants.spacing.base,
        backgroundColor: constants.colors.indigo,
        borderRadius: constants.spacing.small / 2
      },
      style
    ]}
  >
    <Components.LoadableView loading={inProgress} activityIndicatorSize="small">
      <Native.Text
        numberOfLines={1}
        style={[
          styles.interfaceTextWithCenteringAdjustment,
          { color: constants.colors.white }
        ]}
      >
        {title.toUpperCase()}
      </Native.Text>
    </Components.LoadableView>
  </Native.TouchableHighlight>
);
