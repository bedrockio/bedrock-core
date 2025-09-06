import { Button, Tooltip } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useContext, useState } from 'react';

import { downloadResponse } from 'utils/download';
import { safeFileName } from 'utils/formatting';

import SearchContext from './Context';

export default function ExportButton({
  body = {},
  limit = 10000,
  filename,
  size,
  as: Component = Button,
  children = 'Export',
  ...props
}) {
  const [loading, setLoading] = useState(false);

  const context = useContext(SearchContext);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await context.onDataNeeded({
        format: 'csv',
        limit,
        filename: filename
          ? `${safeFileName(filename.replace('.csv', ''))}.csv`
          : 'export.csv',
        ...context.filters,
        ...body,
      });
      await downloadResponse(res);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      showNotification({
        title: 'Error exporting data',
        message: err.message,
        color: 'red',
      });
    }
  };

  if (!loading && context.meta?.total > limit) {
    return (
      <Tooltip
        multiline
        w={220}
        label="Too many rows to export, narrow your search"
        trigger={
          <Component
            loading={loading}
            size={size}
            disabled
            variant="default"
            {...props}>
            {children}
          </Component>
        }
      />
    );
  }

  return (
    <Component
      size={size}
      variant="default"
      loading={loading}
      disabled={context.meta?.total === 0 || loading}
      onClick={handleSubmit}>
      {children}
    </Component>
  );
}
