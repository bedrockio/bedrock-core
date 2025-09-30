// Displays an error message if an error is passed
// also captures and logs error stack for production
// debugging.

import { Alert } from '@mantine/core';
import { useEffect } from 'react';

import { ApiError } from 'utils/api';
import { CustomError } from 'utils/error';
import { captureError } from 'utils/sentry';

export default function ErrorMessage(props) {
  const { error, ...rest } = props;

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
    <Alert color="error" size="small" {...rest}>
      {error.message || 'An error occurred'}
    </Alert>
  );
}
