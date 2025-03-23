import React from 'react';
import { Loader, Box, Paper, Alert, Table } from '@mantine/core';

import ErrorMessage from 'components/ErrorMessage';

import SearchContext from './Context';

function TableWrapper({ colSpan, children }) {
  return (
    <Table.Tr>
      <Table.Td p="md" ta="center" colSpan={colSpan}>
        {children}
      </Table.Td>
    </Table.Tr>
  );
}
function PaperWrapper({ children }) {
  return <Box p="md">{children}</Box>;
}

export default function SearchStatus({}) {
  const context = React.useContext(SearchContext);
  const {
    loading,
    error = { message: 'something went wrong' },
    items,
  } = context;

  if (loading) {
    return <Loader size="sm" />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return null;
}
