import { useRequest } from 'hooks/request';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { downloadResponse } from 'utils/download';
import { notify } from 'utils/notify';

import { useSearch } from './Context';

export default function ExportButton(props) {
  const { children = 'Export', limit = 10000, ...rest } = props;

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
      notify({ message: error.message, color: 'red' });
    },
  });

  const tooMany = meta?.total > limit;

  const button = (
    <Button
      variant="outline"
      disabled={tooMany || meta?.total === 0 || loading}
      onClick={run}
      {...rest}>
      {loading && <Spinner className="text-current" />}
      {children}
    </Button>
  );

  if (tooMany && !loading) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0}>{button}</span>
        </TooltipTrigger>
        <TooltipContent>
          Too many rows to export, narrow your search.
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}
