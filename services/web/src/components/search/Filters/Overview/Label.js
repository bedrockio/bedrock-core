import React from 'react';

import { Label, Icon } from 'semantic';
import { truncate } from 'lodash';
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
    const value = this.context.getFilterValue(this.props.name);
    if (this.state.value != value) {
      this.updateLabel(value);
    }
  }

  updateLabel(value) {
    this.setState({
      value: value,
      loading: true,
    });

    try {
      const [label, value] = this.props.onDataNeeded(value);
      this.setState({
        label,
        value,
      });
    } catch (e) {
      this.setState({
        error: e.message,
      });
    }
  }

  render() {
    const { label, value } = this.state;
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
        {label} {value}
        <Icon style={{ marginTop: '5px' }} name="delete" />
      </Label>
    );
  }
}
