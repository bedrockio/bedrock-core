// react-hot-loader needs to be imported
// before react and react-dom
import 'react-hot-loader';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { SENTRY_DSN } from 'utils/env';
import App from './App';

if (SENTRY_DSN && window.Sentry) {
  window.Sentry.init({ dsn: SENTRY_DSN });
}

const Wrapper = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

ReactDOM.render(<Wrapper />, document.getElementById('root'));
