import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic';
import { debounce, uniqBy, isEmpty, omit } from 'lodash';

import { request } from 'utils/api';

function isValueObject(props) {
  if (props.value && !isEmpty(props.value)) {
    return Array.isArray(props.value)
      ? typeof props.value[0] === 'object'
      : typeof props.value === 'object';
  } else {
    return props.objectMode;
  }
}

export default class SearchDropdown extends React.Component {
  state = {
    items: [],
    selectedItems: [],
    loading: false,
    error: null,
    objectMode: isValueObject(this.props),
  };

  componentDidMount() {
    if (this.props.value) {
      this.fetchSelectedItems();
    }
  }

  fetch = async (body) => {
    if (this.props.onDataNeeded) {
      return this.props.onDataNeeded(body);
    }

    return await request({
      method: 'POST',
      path: this.props.searchPath,
      body: {
        ...body,
        ...this.props.searchBody,
      },
    });
  };

  async fetchSelectedItems() {
    try {
      const selected = await this.fetch({
        ids: (Array.isArray(this.props.value)
          ? this.props.value
          : [this.props.value]
        ).map((item) => this.props.getOptionValue(item)),
      });

      this.setState({
        loading: false,
        selectedItems: selected.data || selected,
      });
    } catch (e) {
      this.setState({
        error: e,
        loading: false,
      });
    }
  }

  async fetchItems(query) {
    this.setState({
      loading: true,
      error: null,
    });
    try {
      const items = await this.fetch(query);
      this.setState({
        items: items.data || items,
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
    const options = {};
    if (searchQuery) {
      options[this.props.keywordField] = searchQuery;
    }
    this.fetchItems(options);
  }, 200);

  onChange = (evt, { value, ...rest }) => {
    const ids = Array.isArray(value) ? value : [value];
    const items = this.getAllItems();
    const selected = ids.map((id) => {
      return items.find((item) => item.id === id);
    });

    if (!this.state.objectMode) {
      return this.props.onChange(evt, {
        ...rest,
        value,
        item: this.props.multiple ? selected : selected[0],
      });
    }

    value = this.props.multiple ? selected : selected[0];
    this.props.onChange(evt, { value, ...rest });
  };

  onFocus = () => {
    if (!this.state.items.length) {
      this.fetchItems();
    }
  };

  getAllItems() {
    return uniqBy([...this.state.items, ...this.state.selectedItems], 'id');
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
        clearable
        selection
        search
        {...omit(this.props, [
          ...Object.keys(propTypeShape),
          'onDataNeeded',
          'searchPath',
          'searchBody',
          'keywordField',
        ])}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        error={!!error}
        loading={loading}
        value={this.getValue()}
        options={this.getOptions()}
        onChange={this.onChange}
        selectOnBlur={false}
        onSearchChange={this.onSearchChange}
        onFocus={this.onFocus}
      />
    );
  }
}

const propTypeShape = {
  objectMode: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  getOptionLabel: PropTypes.func,
  getOptionValue: PropTypes.func,
};

SearchDropdown.propTypes = PropTypes.oneOfType([
  PropTypes.shape({
    ...Dropdown.propTypes,
    ...propTypeShape,
    onDataNeeded: PropTypes.func.isRequired,
  }),
  PropTypes.shape({
    ...Dropdown.propTypes,
    ...propTypeShape,
    searchPath: PropTypes.string.isRequired,
    searchBody: PropTypes.object,
  }),
]).isRequired;

SearchDropdown.defaultProps = {
  keywordField: 'keyword',
  objectMode: true,
  getOptionLabel: (item) => item?.name || item,
  getOptionValue: (item) => item?.id || item,
};
