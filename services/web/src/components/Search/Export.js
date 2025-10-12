import { Button, Tooltip } from '@mantine/core';
import { showNotification } from '@mantine/notifications';

import { useRequest } from 'hooks/request';

import { downloadResponse } from 'utils/download';

import { useSearch } from './Context';

export default function ExportButton(props) {
  const { children = 'Export', limit = 10000, size, ...rest } = props;

  const { meta, filters, onDataNeeded } = useSearch();

  const { run, loading } = useRequest({
    handler: async () => {
      const response = await onDataNeeded({
        ...filters,
        format: 'csv',
        limit,
      });
      await downloadResponse(response);
    },
    onError(error) {
      showNotification({
        message: error.message,
        color: 'red',
      });
    },
  });

  function isTooMany() {
    return meta?.total > limit;
  }

  function render() {
    if (!loading && isTooMany()) {
      return renderTooMany();
    } else {
      return renderButton();
    }
  }

  function getButtonProps() {
    if (isTooMany()) {
      return {
        color: 'red',
        variant: 'outline',
        disabled: true,
      };
    } else {
      return {
        variant: 'default',
        disabled: meta?.total === 0 || loading,
      };
    }
  }

  function renderButton() {
    return (
      <Button
        {...rest}
        {...getButtonProps()}
        size={size}
        loading={loading}
        onClick={run}>
        {children}
      </Button>
    );
  }

  function renderTooMany() {
    return (
      <Tooltip
        w={220}
        multiline
        withArrow
        color="red"
        label="Too many rows to export, narrow your search.">
        {renderButton()}
      </Tooltip>
    );
  }

  return render();
}
