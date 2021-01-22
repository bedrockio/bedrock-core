// react-hot-loader needs to be imported
// before react and react-dom
import 'react-hot-loader';
import Sentry from '@sentry/browser';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SENTRY_DSN } from 'utils/env';
import { SessionProvider } from 'stores';
import App from './App';

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    enable: !['development', 'test'].includes(ENV_NAME),
  });
}

const Wrapper = () => (
  <BrowserRouter>
    <SessionProvider>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </SessionProvider>
  </BrowserRouter>
);

ReactDOM.render(<Wrapper />, document.getElementById('root'));
