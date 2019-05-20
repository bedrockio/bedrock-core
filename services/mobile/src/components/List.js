import React from 'react';

import { Native, helpers, constants, styles } from 'app';

export default class List extends React.Component {
  render = () => {
    const Item = this.props.component;

    return (
      <Native.View style={[styles.stretch, { padding: 0 }]}>
        <Native.FlatList
          data={this.props.items}
          renderItem={({ item }) => <Item data={item} />}
          keyExtractor={(item) => item[this.props.keyProperty || 'id']}
          contentContainerStyle={[
            helpers.isEmpty(this.props.items) && styles.stretch,
            { padding: constants.spacing.large }
          ]}
          {...this.props}
          ListEmptyComponent={
            this.props.ListEmptyComponent
              ? this.props.ListEmptyComponent(this.renderEmptyList)
              : this.renderEmptyList()
          }
        />
      </Native.View>
    );
  };

  renderEmptyList = (message) => (
    <Native.Text
      style={[
        styles.interfaceText,
        {
          marginHorizontal: '12.5%',
          color: constants.colors.darkGray,
          textAlign: 'center'
        }
      ]}
    >
      {message || this.props.listEmptyMessage}
    </Native.Text>
  );
}
