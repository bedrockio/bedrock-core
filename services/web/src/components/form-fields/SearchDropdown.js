import React from 'react';
import { Dropdown } from 'semantic-ui-react';
import { get, omit } from 'lodash';

export default class SearchDropdown extends React.Component {
  state = {
    defaultOptions: [],
    options: [],
    loading: false,
    error: false
  };

  componentDidMount() {
    const { valueField = 'id', multiple } = this.props;
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
    const { valueField = 'id', textField = 'name', fetchData } = this.props;
    this.setState({
      search,
      loading: true,
      error: false
    });

    fetchData(search)
      .then(({ data }) => {
        const options = data.map((item) => {
          return {
            key: get(item, valueField),
            text: get(item, textField),
            value: get(item, valueField)
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

  render() {
    const { state } = this;
    const { textField = 'name', multiple } = this.props;
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
        options={state.search ? state.options : state.defaultOptions}
        onSearchChange={(e, { searchQuery }) =>
          this.loadOptions({ [textField]: searchQuery })
        }
        {...props}
      />
    );
  }
}
