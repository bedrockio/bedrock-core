import React from 'react';

import { Native, constants, styles } from 'app';

import checkmark from 'images/checkmark.png';

export default class Checkbox extends React.Component {
  render = () => (
    <Native.TouchableOpacity
      disabled={this.props.disabled}
      onPress={this.onPress}
      style={[
        styles.row,
        styles.centerChildren,
        { margin: constants.spacing.base },
        this.props.style
      ]}
    >
      <Native.View
        style={[
          styles.centerChildren,
          styles.borderedInput,
          {
            width: 35,
            height: 35,
            marginRight: constants.spacing.large
          },
          this.isChecked() && {
            backgroundColor: constants.colors.indigo,
            borderColor: constants.colors.indigo
          },
          this.props.invalid && styles.inputWithError
        ]}
      >
        {this.renderCheckmark()}
      </Native.View>
      <Native.Text style={[styles.flex, styles.interfaceText]}>
        {this.props.title}
      </Native.Text>
    </Native.TouchableOpacity>
  );

  onPress = () => this.props.onValueChange(!this.isChecked());

  isChecked = () => Boolean(this.props.value);

  renderCheckmark = () => {
    if (this.isChecked()) return <Native.Image source={checkmark} />;
  };
}
