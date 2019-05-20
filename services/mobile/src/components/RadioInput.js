import React from 'react';

import { Native } from 'app';

export default class RadioInput extends React.Component {
  render = () => (
    <Native.View style={this.props.style}>{this.renderChoices()}</Native.View>
  );

  renderChoices = () => {
    const Option = this.props.component;

    return this.props.choices.map((content, index) => (
      <Option
        content={content}
        selected={index === this.props.value}
        disabled={this.props.disabled}
        invalid={this.props.invalid}
        onPress={() => this.props.onValueChange(index)}
        key={index}
      />
    ));
  };
}
