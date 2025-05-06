import { Button, Tooltip } from '@mantine/core';

import { safeFileName } from 'utils/formatting';
import { downloadResponse } from 'utils/download';

import SearchContext from './Context';
import { IconDownload } from '@tabler/icons-react';
import { useContext, useState } from 'react';
import { showNotification } from '@mantine/notifications';

export default function ExportButton({
  body = {},
  limit = 10000,
  filename,
  size,
  as: As = Button,
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
          <As
            loading={loading}
            size={size}
            disabled
            variant="default"
            rightSection={<IconDownload size={14} />}
            {...props}>
            {children}
          </As>
        }
      />
    );
  }

  return (
    <As
      size={size}
      variant="default"
      rightSection={<IconDownload size={14} />}
      loading={loading}
      disabled={context.meta?.total === 0 || loading}
      onClick={handleSubmit}>
      {children}
    </As>
  );
}
