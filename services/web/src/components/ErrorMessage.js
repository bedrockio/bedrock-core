// Displays an error message if an error is passed
// also captures and logs error stack for production
// debugging.

import { useEffect } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

import { ApiError } from 'utils/api';
import { CustomError } from 'utils/error';
import { captureError } from 'utils/sentry';

export default function ErrorMessage(props) {
  const { error, className } = props;

  useEffect(() => {
    if (canLogError(error)) {
      // eslint-disable-next-line
      console?.error(error);
      captureError(error);
    }
  }, [error]);

  if (!error) {
    return null;
  }

  function canLogError(error) {
    if (error instanceof ApiError) {
      return error.status >= 500;
    } else if (error instanceof CustomError) {
      return false;
    } else {
      return !!error;
    }
  }

  return (
    <Alert variant="destructive" className={cn('mb-4', className)}>
      <AlertDescription>{error.message || 'An error occurred'}</AlertDescription>
    </Alert>
  );
}
