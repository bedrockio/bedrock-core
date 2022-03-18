import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic';
import { debounce, omit, uniqBy } from 'lodash';

export default class SearchDropdown extends React.Component {
  state = {
    items: [],
    loading: false,
    error: null,
  };

  componentDidMount() {
    this.loadData();
  }

  async loadData(query = '') {
    try {
      this.setState({
        loading: false,
        error: null,
      });
      const data = await this.props.onDataNeeded(query);
      this.setState({
        items: data,
        loading: false,
      });
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  }

  onSearchChange = debounce((evt, { searchQuery }) => {
    this.loadData(searchQuery);
  }, 200);

  onChange = (evt, { value, ...rest }) => {
    const ids = Array.isArray(value) ? value : [value];
    const items = this.getAllItems();
    const selected = ids.map((id) => {
      return items.find((item) => item.id === id);
    });
    value = this.props.multiple ? selected : selected[0];
    this.props.onChange(evt, { value, ...rest });
  };

  getAllItems() {
    return uniqBy([...this.state.items, ...this.getSelectedItems()], 'id');
  }

  getSelectedItems() {
    const { value } = this.props;
    if (Array.isArray(value)) {
      return value;
    } else if (value) {
      return [value];
    } else {
      return [];
    }
  }

  getOptions() {
    return this.getAllItems().map((item) => {
      const { getOptionLabel, getOptionValue } = this.props;
      const value = getOptionValue(item);
      return {
        key: value,
        text: getOptionLabel(item),
        value: value,
      };
    });
  }

  getValue() {
    const { multiple, value } = this.props;
    if (multiple) {
      return value.map((obj) => obj.id || obj);
    } else {
      return value?.id || value;
    }
  }

  render() {
    const { loading, error } = this.state;

    return (
      <Dropdown
        {...omit(this.props, Object.keys(SearchDropdown.propTypes))}
        error={!!error}
        loading={loading}
        value={this.getValue()}
        options={this.getOptions()}
        onChange={this.onChange}
        onSearchChange={this.onSearchChange}
        selection
        clearable
        search
      />
    );
  }
}

SearchDropdown.propTypes = {
  onChange: PropTypes.func.isRequired,
  onDataNeeded: PropTypes.func.isRequired,
  getOptionLabel: PropTypes.func,
  getOptionValue: PropTypes.func,
};

SearchDropdown.defaultProps = {
  getOptionLabel: (item) => item.name,
  getOptionValue: (item) => item.id || item,
};
