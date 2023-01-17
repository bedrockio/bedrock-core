import React from 'react';
import { Loader, Message, Segment } from 'semantic';

import ErrorMessage from 'components/ErrorMessage';

import SearchContext from './Context';

export default class SearchStatus extends React.Component {
  static contextType = SearchContext;

  render() {
    const { loading, error, items } = this.context;

    if (loading) {
      return (
        <Segment style={{ height: '100px' }}>
          <Loader>Loading</Loader>
        </Segment>
      );
    }

    if (error) {
      return <ErrorMessage error={error} />;
    }

    if (items.length === 0) {
      return (
        <Segment>
          <Message>{this.props.noResults || 'No results found'}</Message>
        </Segment>
      );
    }

    return null;
  }
}
