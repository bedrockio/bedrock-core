import React from 'react';
import { Button, Popup } from 'semantic';

import { safeFileName } from 'utils/formatting';

import SearchContext from './Context';

export default class ExportButton extends React.Component {
  static contextType = SearchContext;

  state = {
    loading: false,
    error: null,
  };

  handleSubmit = async () => {
    this.setState({ loading: true, error: null });
    const body = this.props.body || {};
    try {
      await this.context.onDataNeeded({
        format: 'csv',
        limit: this.props.limit,
        filename: this.props.filename
          ? `${safeFileName(this.props.filename.replace('.csv', ''))}.csv`
          : 'export.csv',
        ...this.context.filters,
        ...body,
      });
      this.setState({
        loading: false,
      });
    } catch (err) {
      this.setState({
        loading: false,
        error: err,
      });
    }
  };

  render() {
    const { loading, error } = this.state;
    const { meta } = this.context;

    const As = this.props.as || Button;

    if (!loading && meta?.total > this.props.limit) {
      return (
        <Popup
          content="Too many rows to export, narrow your search"
          on="click"
          trigger={
            <As
              loading={loading}
              primary
              basic
              icon={error || 'download'}
              content={'Export'}
            />
          }
        />
      );
    }

    return (
      <As
        loading={loading}
        disabled={meta?.total === 0 || loading}
        negative={error}
        title={error?.message}
        primary
        basic
        icon={error || 'download'}
        content={'Export'}
        onClick={this.handleSubmit}
      />
    );
  }
}

ExportButton.defaultProps = {
  limit: 100000,
};
