import React from 'react';
import { Dropdown } from 'semantic-ui-react';
import { get, omit, flatten, uniqBy } from 'lodash';

export default class SearchDropdown extends React.Component {
  static defaultProps = {
    valueField: 'id',
    textField: 'name',
  };

  state = {
    defaultOptions: [],
    options: [],
    loading: false,
    error: false,
  };

  getValues() {
    const { value, valueField, multiple } = this.props;
    let normalizedValue = value;
    if (multiple && value.length && typeof value[0] === 'object') {
      normalizedValue = value.map((object) => object[valueField]);
    }
    return normalizedValue;
  }

  componentDidMount() {
    const { valueField, multiple } = this.props;
    const fetchField = multiple ? `${valueField}s` : valueField;
    const value = this.getValues();
    Promise.all(
      [
        this.loadOptions({}),
        value &&
          this.loadOptions({
            [fetchField]: value,
          }),
      ].filter(Boolean)
    ).then((options) => {
      this.setState({
        defaultOptions: flatten(options),
      });
    });
  }

  loadOptions(search) {
    const { valueField, textField, fetchData } = this.props;
    this.setState({
      search,
      loading: true,
      error: false,
    });

    return fetchData(search)
      .then(({ data }) => {
        const options = data.map((item) => {
          const key = get(item, valueField);
          return {
            text: get(item, textField),
            value: key,
          };
        });

        this.setState({
          loading: false,
          options,
        });
        return options;
      })
      .catch(() => {
        this.setState({
          loading: false,
          error: true,
        });
      });
  }

  onHandleSearchChange = (e, { searchQuery }) => {
    const { textField } = this.props;
    if (searchQuery.length) {
      this.loadOptions({ [textField]: searchQuery });
    }
  };

  render() {
    const { state } = this;
    const { multiple } = this.props;
    const props = omit(this.props, ['fetchData', 'valueField', 'textField']);
    let options = state.defaultOptions;

    if (state.search) {
      if (multiple) {
        options = uniqBy([...state.defaultOptions, ...state.options], (option) => option.value);
      } else {
        options = state.options;
      }
    }

    const normalizedValue = this.getValues();

    return (
      <Dropdown
        error={state.error}
        search
        selection
        clearable={this.props.clearable}
        loading={state.loading}
        options={options}
        onSearchChange={this.onHandleSearchChange}
        {...props}
        value={normalizedValue}
      />
    );
  }
}
