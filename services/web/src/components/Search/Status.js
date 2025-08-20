import { Loader } from '@mantine/core';
import React from 'react';

import ErrorMessage from 'components/ErrorMessage';

import SearchContext from './Context';

export default function SearchStatus() {
  const context = React.useContext(SearchContext);
  const { loading, error = { message: 'something went wrong' } } = context;

  if (loading) {
    return <Loader size="sm" />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return null;
}
