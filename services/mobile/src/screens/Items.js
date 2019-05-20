import React from 'react';

import { Native, Components, helpers, constants, Api, styles } from 'app';

import menuIcon from 'images/menuIcon.png';

export default class Items extends React.Component {
  static navigationOptions = (props) => ({
    title: 'Items',
    headerBackTitle: 'Items',
    headerRight: (
      <Native.TouchableOpacity
        onPress={helpers.goToScreenCallback('Account')}
        style={[
          styles.centerChildren,
          { height: '100%', paddingHorizontal: constants.spacing.base }
        ]}
      >
        <Native.Image source={menuIcon} />
      </Native.TouchableOpacity>
    )
  });

  render = () => (
    <Components.LoadableList
      items={Api.items}
      component={Components.Item}
      listEmptyMessage="There are no items"
    />
  );
}
