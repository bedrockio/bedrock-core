import * as Sentry from '@sentry/browser';
import { SENTRY_DSN, ENV_NAME } from 'utils/env';

if (SENTRY_DSN && !['development', 'test'].includes(ENV_NAME)) {
  Sentry.init({
    dsn: SENTRY_DSN,
  });
}

export function captureError(err, extras) {
  if (SENTRY_DSN) {
    if (extras) {
      for (let [name, value] of Object.entries(extras)) {
        Sentry.setExtra(name, value);
      }
    }
    Sentry.captureException(err);
  }
}
