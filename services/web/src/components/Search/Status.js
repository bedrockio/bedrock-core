import { Loader, Text } from '@mantine/core';

import { formatNumber } from 'utils/formatting';

import { useSearch } from './Context';

export default function SearchStatus() {
  const { meta, loading, error } = useSearch();

  if (loading) {
    return <Loader size="sm" />;
  } else if (error) {
    return (
      <Text size="sm" c="error">
        {error.message}
      </Text>
    );
  } else if (meta) {
    const total = formatNumber(meta.total);
    const s = meta.total === 1 ? '' : 's';
    return (
      <Text size="sm">
        {total} result{s} found
      </Text>
    );
  }

  return null;
}
