import React from 'react';

import { Label, Icon } from 'semantic';
import SearchContext from '../../Context';

export default class OverviewLabel extends React.Component {
  static contextType = SearchContext;

  state = {
    loading: false,
    value: null,
    label: null,
  };

  clearFilter = () => {
    this.context.onFilterChange({
      name: this.props.name,
      value: undefined,
    });
  };

  componentDidUpdate() {
    const filteredValue = this.context.getFilterValue(this.props.name);
    if (this.state.filteredValue != filteredValue) {
      this.updateLabel(filteredValue);
    }
  }

  async updateLabel(filteredValue) {
    this.setState({
      filteredValue: filteredValue,
      loading: true,
    });

    try {
      const value = await this.props.field.getDisplayValue(
        filteredValue?.id || filteredValue
      );
      this.setState({
        value,
      });
    } catch (e) {
      this.setState({
        error: e.message,
      });
    }
  }

  render() {
    const { value } = this.state;
    const field = this.props.field;

    return (
      <Label
        basic
        style={{
          height: '36px',
          margin: '0',
          marginLeft: '0.5em',
          lineHeight: '21px',
          cursor: 'pointer',
        }}
        onClick={() => this.clearFilter()}>
        {field.label} {value}
        <Icon style={{ marginTop: '5px' }} name="delete" />
      </Label>
    );
  }
}
