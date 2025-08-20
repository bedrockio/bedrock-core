import React from 'react';

import { formatNumber } from 'utils/formatting';

import SearchContext from './Context';
import { Text } from '@mantine/core';

export default function Total({ itemName }) {
  const { meta } = React.useContext(SearchContext);
  if (!meta) {
    return null;
  }

  return (
    <Text size="sm" style={{ color: '#6C727F' }}>
      {meta?.total ? formatNumber(meta?.total) : 'No'} {itemName || 'results'}{' '}
      found
    </Text>
  );
}
