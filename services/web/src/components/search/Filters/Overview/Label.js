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

  componentDidUpdate() {
    const filteredValue = this.context.filters[this.props.name];
    if (this.state.filteredValue !== filteredValue) {
      this.updateLabel(filteredValue);
    }
  }

  clearFilter = () => {
    this.context.onFilterChange({
      name: this.props.name,
      value: undefined,
    });
  };

  async updateLabel(filteredValue) {
    const { mapping } = this.props;
    if (!mapping.getDisplayValue) {
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
      error: null,
    });

    try {
      const value = await mapping.getDisplayValue(
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
    if (this.state.error) {
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
          onClick={() => this.clearFilter()}
          icon="exclamation-triangle"
          title={this.state.error.message}></Label>
      );
    }

    return (
      <Label basic onClick={() => this.clearFilter()}>
        {this.state.loading ? '...' : this.renderLabelContent()}
        <Icon style={{ marginTop: '5px' }} name="delete" />
      </Label>
    );
  }

  renderLabelContent() {
    const { mapping } = this.props;
    const { value } = this.state;

    if (mapping.format) {
      return mapping.format(value);
    }

    if (mapping.range) {
      return `${mapping.label}: ${[
        renderValue(mapping.type, value.gte),
        renderValue(mapping.type, value.lte),
      ].join(' - ')}`;
    }

    if (mapping.multiple && Array.isArray(value)) {
      return `${mapping.label}: ${value
        .map((v) => renderValue(mapping.type, v))
        .join(', ')}`;
    }

    return [mapping.label, renderValue(mapping.type, value)].join(': ');
  }
}
