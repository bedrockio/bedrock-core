import React from 'react';
import PropTypes from 'prop-types';
import { debounce, uniqBy, omit } from 'lodash';
import { Form } from 'semantic';
import { request } from 'utils/api';

export default class ReferenceField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: false,
    };
  }

  // Events

  onChange = (evt, { value, ...rest }) => {
    if (this.isMultiple()) {
      value = this.getItems().filter((item) => value.includes(item.id));
    } else {
      value = this.getItems().find((item) => item.id === value);
    }
    this.props.onChange(evt, { value, ...rest });
  };

  onSearchChange = (evt, { searchQuery: query }) => {
    this.search(query);
  };

  search = debounce(async (query) => {
    if (query) {
      const { path } = this.props;
      this.setState({
        loading: true,
      });
      const { data } = await request({
        method: 'POST',
        path,
        body: {
          ...this.props.searchProps,
          keyword: query,
          limit: 20,
        },
      });
      this.setState({
        data,
        loading: false,
      });
    } else {
      this.setState({
        data: [],
        loading: false,
      });
    }
  }, 300);

  // Helpers

  isMultiple(value = this.props.value) {
    return Array.isArray(value);
  }

  getValue() {
    const { value } = this.props;
    if (this.isMultiple()) {
      return value.map((item) => item.id);
    } else {
      return value?.id;
    }
  }

  getItems() {
    const { value } = this.props;
    const values = this.isMultiple() ? value : [value];
    return uniqBy([...values, ...this.state.data], 'id');
  }

  getOptions() {
    return this.getItems().map((item) => {
      const { getOptionLabel, getOptionValue } = this.props;
      return {
        text: getOptionLabel(item),
        value: getOptionValue(item),
      };
    });
  }

  render() {
    const { placeholder } = this.props;
    const { loading } = this.state;
    const props = omit(this.props, Object.keys(ReferenceField.propTypes));
    return (
      <Form.Dropdown
        search
        selection
        loading={loading}
        value={this.getValue()}
        options={this.getOptions()}
        multiple={this.isMultiple()}
        placeholder={placeholder}
        noResultsMessage={loading ? 'Loading...' : 'No results.'}
        renderLabel={this.renderLabel}
        onSearchChange={this.onSearchChange}
        onChange={this.onChange}
        {...props}
      />
    );
  }

  renderLabel = (label) => {
    const { icon, color } = this.props;
    return {
      color,
      content: label.text,
      icon,
    };
  };
}

ReferenceField.propTypes = {
  icon: PropTypes.string,
  color: PropTypes.string,
  path: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  searchProps: PropTypes.object,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.array,
  ]),
  getOptionLabel: PropTypes.func,
  getOptionValue: PropTypes.func,
};

ReferenceField.defaultProps = {
  placeholder: 'Search',
  getOptionLabel: (item) => item.name,
  getOptionValue: (item) => item.id,
};
