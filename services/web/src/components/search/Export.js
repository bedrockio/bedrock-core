import React from 'react';
import { Button } from 'semantic';
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

    const tooManyRows = meta?.total > this.props.limit;

    return (
      <Button
        loading={loading}
        disabled={meta?.total === 0 || loading || tooManyRows}
        negative={error}
        title={error?.message}
        primary
        basic
        icon={error || tooManyRows ? 'triangle-exclamation' : 'download'}
        content={tooManyRows ? 'Too many rows' : 'Export'}
        onClick={this.handleSubmit}
      />
    );
  }
}

ExportButton.defaultProps = {
  limit: 10000,
};
