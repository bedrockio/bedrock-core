import * as Sentry from '@sentry/browser';
import { SENTRY_DSN, ENV_NAME } from 'utils/env';

if (SENTRY_DSN && !['development', 'test'].includes(ENV_NAME)) {
  Sentry.init({
    dsn: SENTRY_DSN
  });
}
