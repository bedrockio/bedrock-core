import React from 'react';
import SearchContext from './Context';
import { Loader, Message, Segment, Dimmer } from '/semantic';
import ErrorMessage from '/components/ErrorMessage';

export default class SearchStatus extends React.Component {
  static contextType = SearchContext;

  render() {
    const { loading, error, items } = this.context;

    if (loading) {
      return (
        <Segment style={{ height: '100px' }}>
          <Dimmer active inverted>
            <Loader>Loading</Loader>
          </Dimmer>
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
