import React from 'react';

import { Label, Icon } from 'semantic';
import SearchContext from '../../Context';

import { formatDate } from 'utils/date';

function renderValue(type, value) {
  switch (type) {
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'date':
      return formatDate(value);
    default:
      return value;
  }
}

export default class OverviewLabel extends React.Component {
  static contextType = SearchContext;

  state = {
    loading: false,
    value: this.context.filters[this.props.name],
    label: null,
    filteredValue: this.context.filters[this.props.name],
  };

  componentDidMount() {
    this.updateLabel(this.state.filteredValue);
  }

  clearFilter = () => {
    this.context.onFilterChange({
      name: this.props.name,
      value: undefined,
    });
  };

  componentDidUpdate() {
    const filteredValue = this.context.filters[this.props.name];
    if (this.state.filteredValue !== filteredValue) {
      this.updateLabel(filteredValue);
    }
  }

  async updateLabel(filteredValue) {
    const { param } = this.props;
    if (!param.getDisplayValue) {
      this.setState({
        filteredValue: filteredValue,
        value: filteredValue,
        loading: false,
      });
      return;
    }

    this.setState({
      filteredValue: filteredValue,
      loading: true,
    });

    try {
      const value = await param.getDisplayValue(
        Array.isArray(filteredValue)
          ? filteredValue.map((item) => item.id || item)
          : filteredValue?.id || filteredValue
      );

      this.setState({
        value,
        loading: false,
      });
    } catch (e) {
      this.setState({
        error: e.message,
      });
    }
  }

  render() {
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
        {this.state.loading ? '...' : this.renderLabelContent()}
        <Icon style={{ marginTop: '5px' }} name="delete" />
      </Label>
    );
  }

  renderLabelContent() {
    const { param } = this.props;
    const { value } = this.state;

    if (param.format) {
      return param.format(value);
    }

    if (param.range) {
      return `${param.label}: ${[
        renderValue(param.type, value.gte),
        renderValue(param.type, value.lte),
      ].join(' - ')}`;
    }

    if (param.multiple && Array.isArray(value)) {
      return `${param.label}: ${value
        .map((v) => renderValue(param.type, v))
        .join(', ')}`;
    }

    return [param.label, renderValue(param.type, value)].join(': ');
  }
}
