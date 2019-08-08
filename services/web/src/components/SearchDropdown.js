import React from 'react';
import { Dropdown } from 'semantic-ui-react';
import { get, omit } from 'lodash';

export default class SearchDropdown extends React.Component {
  static defaultProps = {
    valueField: 'id',
    textField: 'name'
  };

  state = {
    defaultOptions: [],
    options: [],
    loading: false,
    error: false
  };

  componentDidMount() {
    const { valueField, multiple } = this.props;
    const fetchField = multiple ? `${valueField}s` : valueField;
    Promise.all(
      [
        this.loadOptions({}),
        this.props.value &&
          this.loadOptions({
            [fetchField]: this.props.value
          })
      ].filter(Boolean)
    ).then((options) => {
      this.setState({
        defaultOptions: [...options]
      });
    });
  }

  loadOptions(search) {
    const { valueField, textField, fetchData } = this.props;
    this.setState({
      search,
      loading: true,
      error: false
    });

    fetchData(search)
      .then(({ data }) => {
        const options = data.map((item) => {
          const key = get(item, valueField);
          return {
            text: get(item, textField),
            value: key
          };
        });

        this.setState({
          loading: false,
          options
        });
        return options;
      })
      .catch(() => {
        this.setState({
          loading: false,
          error: true
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
        options = [...state.defaultOptions, ...state.options];
      } else {
        options = state.options;
      }
    }

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
      />
    );
  }
}
